/* DOM-Ausgabe ausschließlich als Text: weder Nutzereingaben noch Antworten sind HTML. */
const $ = (id) => document.getElementById(id);
const form = $('chat-form');
const input = $('question');
const messages = $('messages');
const maxLength = 1500;
let history = [];
let pending = null;
let controller = null;
let generation = 0;

if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embed');
if (document.body.dataset.mode === 'demo') {
  $('demo-banner').hidden = false;
  $('privacy-note').textContent = 'Lokale Demo: keine Übertragung an OpenAI. Der Verlauf bleibt nur in diesem Tab.';
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function scrollDown() { $('chat-scroll').scrollTop = $('chat-scroll').scrollHeight; }
function resizeInput() {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 125)}px`;
  $('char-count').textContent = `${input.value.length} / ${maxLength}`;
}
function setBusy(busy) {
  $('loading').hidden = !busy;
  $('send').disabled = busy;
  $('retry').disabled = busy;
  input.disabled = busy;
  document.querySelectorAll('[data-question]').forEach((button) => { button.disabled = busy; });
  messages.setAttribute('aria-busy', String(busy));
}
function addMessage(role, text) {
  const article = element('article', `message ${role}`);
  const header = element('div', 'message-header');
  if (role === 'assistant') header.append(element('span', 'avatar', 'O'));
  header.append(element('span', '', role === 'user' ? 'Du' : 'OhmBot'));
  article.append(header);
  if (text) article.append(element('p', '', text));
  messages.append(article);
  return article;
}
function renderAnswer(data) {
  const article = addMessage('assistant', data.message);
  for (const block of data.blocks) {
    if (block.title) article.append(element('h2', '', block.title));
    article.append(element('p', '', block.text));
    if (block.citations?.length) article.append(element('small', 'paragraph-citations', `Belege: ${block.citations.map((n) => `[${n}]`).join(' ')}`));
  }
  if (data.notice) article.append(element('p', 'answer-notice', data.notice));
  if (data.sources.length) {
    const sources = element('div', 'sources');
    sources.append(element('span', 'sources-label', 'QUELLEN · TH NÜRNBERG'));
    for (const [index, source] of data.sources.entries()) {
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || !(url.hostname === 'th-nuernberg.de' || url.hostname.endsWith('.th-nuernberg.de'))) continue;
      const link = element('a', 'source-link', `[${index + 1}] ${source.title} ↗`);
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(element('small', '', `${source.locator ? `${source.locator} · ` : ''}Geprüft am ${source.checked_at.split('-').reverse().join('.')}`));
      sources.append(link);
    }
    article.append(sources);
  }
}
async function sendQuestion(text, retry = false) {
  if (controller) return;
  if (!text || text.length > maxLength) return;
  if (!retry) {
    // Bei einem neuen Versuch mit anderem Text zählt die gescheiterte Frage nicht zum Kontext.
    pending = { text };
    $('welcome').hidden = true;
    addMessage('user', text);
    input.value = '';
    resizeInput();
  }
  $('error-box').hidden = true;
  setBusy(true);
  scrollDown();
  const currentGeneration = generation;
  const requestController = new AbortController();
  controller = requestController;
  const timeout = setTimeout(() => requestController.abort(), 55000);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-6) }),
      signal: requestController.signal,
    });
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) {
      const fallback = response.status === 429 ? 'Zu viele Anfragen. Bitte warte eine Minute und versuche es erneut.' : 'OhmBot ist gerade nicht erreichbar. Bitte versuche es später erneut.';
      throw new Error(data?.error || fallback);
    }
    if (!data || !Array.isArray(data.blocks) || !Array.isArray(data.sources)) throw new Error('Die Antwort konnte nicht gelesen werden. Bitte versuche es erneut.');
    if (currentGeneration !== generation) return;
    renderAnswer(data);
    const answerContext = [data.message, ...data.blocks.map((block) => block.text)].filter(Boolean).join('\n').slice(0, 1500);
    history.push({ role: 'user', content: text }, { role: 'assistant', content: answerContext });
    history = history.slice(-6);
    pending = null;
  } catch (error) {
    if (currentGeneration !== generation) return;
    $('error-text').textContent = error.name === 'AbortError' ? 'Die Antwort dauert zu lange. Bitte versuche es erneut.' : error instanceof TypeError ? 'Verbindung unterbrochen. Prüfe deine Internetverbindung und versuche es erneut.' : error.message;
    $('error-box').hidden = false;
  } finally {
    clearTimeout(timeout);
    if (currentGeneration === generation) {
      controller = null;
      setBusy(false);
      scrollDown();
      input.focus({ preventScroll: true });
    }
  }
}
form.addEventListener('submit', (event) => { event.preventDefault(); sendQuestion(input.value.trim()); });
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
});
document.querySelectorAll('[data-question]').forEach((button) => button.addEventListener('click', () => sendQuestion(button.dataset.question)));
$('retry').addEventListener('click', () => { if (pending) sendQuestion(pending.text, true); });
function resetChat() {
  generation += 1;
  controller?.abort();
  controller = null;
  history = [];
  pending = null;
  messages.replaceChildren();
  $('welcome').hidden = false;
  $('error-box').hidden = true;
  input.value = '';
  setBusy(false);
  resizeInput();
  input.focus({ preventScroll: true });
  $('chat-scroll').scrollTop = 0;
}
$('new-chat').addEventListener('click', resetChat);
$('new-chat-top').addEventListener('click', resetChat);
