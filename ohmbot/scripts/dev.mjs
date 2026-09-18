import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createChatHandler } from '../lib/chat-service.js';

const demo = process.argv.includes('--demo');
const staticOnly = process.argv.includes('--static');
const port = Number(process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] || 3000);
// Die Demo-Auswahl wird nur in diesem lokalen Server injiziert, nie in Netlify.
function demoSelector({ input, entries }) {
  const question = input.message.toLocaleLowerCase('de');
  const scored = entries.map((entry) => ({ entry, score: entry.keywords.reduce((sum, key) => sum + (question.includes(key) ? key.length : 0), 0) })).filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
  return { status: scored.length ? 'answered' : 'unknown', entry_ids: scored.slice(0, 1).map(({ entry }) => entry.id) };
}
const chat = createChatHandler(demo ? { selector: demoSelector, env: {} } : {});
const files = new Map([
  ['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']], ['/script.js', ['script.js', 'text/javascript']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
  ['/embed-example.html', ['embed-example.html', 'text/html']], ['/embed-example.css', ['embed-example.css', 'text/css']], ['/embed-example.js', ['embed-example.js', 'text/javascript']],
]);
const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://localhost:${port}`);
    if (!staticOnly && ['/api/chat', '/.netlify/functions/chat'].includes(requestUrl.pathname)) {
      // Identische Web-Request/Response-Schnittstelle wie in Netlify.
      const init = { method: req.method, headers: req.headers };
      if (!['GET', 'HEAD'].includes(req.method)) { init.body = req; init.duplex = 'half'; }
      const result = await chat(new Request(requestUrl, init));
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(await result.text());
      return;
    }
    const file = files.get(requestUrl.pathname);
    if (!file || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); res.end('Nicht gefunden'); return; }
    let body = await readFile(new URL(`../${file[0]}`, import.meta.url));
    if (demo && file[0] === 'index.html') body = body.toString().replace('data-mode="live"', 'data-mode="demo"');
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? '' : body);
  } catch {
    if (!res.headersSent) res.writeHead(500);
    res.end('Lokaler Serverfehler');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`OhmBot ${demo ? 'DEMO (ohne KI)' : staticOnly ? 'statische Vorschau' : 'lokal'}: http://localhost:${port}`));
