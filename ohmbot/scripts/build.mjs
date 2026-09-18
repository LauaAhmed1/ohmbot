import { mkdir, copyFile, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateKnowledge, knowledge } from '../lib/knowledge.js';

export const publicFiles = ['index.html', 'style.css', 'script.js', 'favicon.svg', 'embed-example.html', 'embed-example.css', 'embed-example.js'];
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
validateKnowledge(knowledge);
await mkdir(dist, { recursive: true });
// Ein separates, streng erlaubnisbasiertes Veröffentlichungsverzeichnis verhindert,
// dass .env, Backend, README oder Wissensdatei versehentlich ausgeliefert werden.
for (const item of await readdir(dist, { withFileTypes: true })) {
  if (item.isDirectory()) throw new Error('Unerwarteter Unterordner in dist. Bitte vor dem Build prüfen.');
  if (!publicFiles.includes(item.name)) await unlink(new URL(item.name, dist));
}
for (const file of publicFiles) await copyFile(new URL(file, root), new URL(file, dist));
console.log(`OhmBot: ${publicFiles.length} öffentliche Dateien gebaut: ${fileURLToPath(dist)}`);
