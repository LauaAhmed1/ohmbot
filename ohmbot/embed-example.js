const toggle = document.getElementById('widget-toggle');
const panel = document.getElementById('widget-panel');
const frame = document.getElementById('widget-frame');
function setOpen(open) {
  if (open && !frame.getAttribute('src')) frame.src = frame.dataset.src;
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'OhmBot schließen ×' : 'OhmBot öffnen ↗';
  if (!open) toggle.focus();
}
toggle.addEventListener('click', () => setOpen(panel.hidden));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
