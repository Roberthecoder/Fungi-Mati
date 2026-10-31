// build.mjs — inyecta el conocimiento (Markdown, JSON) en index.html y escribe dist/index.html.
// Uso: node build.mjs
// Sin dependencias: solo Node 18+.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const r = (p) => readFile(join(root, p), "utf8");

const MARK = "window.FM_DATA = null; /*@@FM_DATA@@*/";
const LANG_ORDER = ["es", "en", "nah", "yua", "tsz", "hch"];

const html = await r("index.html");
if (!html.includes(MARK)) throw new Error("index.html no tiene el marcador de inyección: " + MARK);

const es = JSON.parse(await r("knowledge/i18n/es.json"));
const i18n = {};
const files = (await readdir(join(root, "knowledge/i18n"))).filter((f) => f.endsWith(".json"));
for (const f of files) {
  const code = f.replace(/\.json$/, "");
  const data = JSON.parse(await r("knowledge/i18n/" + f));
  // Avisar si a una traducción le faltan llaves (la página cae a español en esas).
  const missing = Object.keys(es).filter((k) => k !== "_meta" && !(k in data));
  if (missing.length) console.warn(`[i18n] ${code}: faltan ${missing.length} llaves (se usará español): ${missing.slice(0, 5).join(", ")}…`);
  i18n[code] = data;
}
const ordered = Object.fromEntries(
  [...LANG_ORDER.filter((l) => i18n[l]), ...Object.keys(i18n).filter((l) => !LANG_ORDER.includes(l))].map((l) => [l, i18n[l]])
);

const protocolo = await r("knowledge/protocolo.md");
for (const id of ["destino", "glosario", "seguridad", "especies", "inicio", "preparacion", "incubacion", "fructificacion", "cosecha", "problemas", "faq"]) {
  for (const lg of ["es", "en"]) if (!protocolo.includes(`<!-- ${lg}:${id} -->`)) console.warn(`[protocolo] falta el bloque ${lg}:${id}`);
}

const data = {
  version: 2,
  builtAt: new Date().toISOString(),
  protocolo,
  fuentes: await r("knowledge/FUENTES.md"),
  instrucciones: await r("knowledge/instrucciones-ia.md"),
  config: JSON.parse(await r("config.json")),
  i18n: ordered,
};

// JSON seguro dentro de <script>: escapar "<" y separadores de línea.
const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const out = html.replace(MARK, () => `window.FM_DATA = ${json};`);

await mkdir(join(root, "dist"), { recursive: true });
await writeFile(join(root, "dist/index.html"), out);
console.log(`dist/index.html escrito: ${(out.length / 1024).toFixed(1)} KiB, idiomas: ${Object.keys(ordered).join(", ")}`);
