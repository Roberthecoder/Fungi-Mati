# Fungi Mati

**De residuos a alimento.** Un asistente gratuito que guía a cualquier persona, en su idioma y a cualquier hora, para convertir residuos lignocelulósicos (bagazo de agave, el residuo del tequila y el mezcal; aserrín; bagazo de café; fibra de coco) en setas comestibles del género *Pleurotus*: desde elegir el sustrato hasta la cosecha. También diagnostica problemas con una foto y registra datos de cultivo para publicar un dataset abierto.

Proyecto de Roberto Carlos Navarro Félix (Ingeniería en Biotecnología, Tec de Monterrey, campus Guadalajara), con apoyo temprano del RISE Innovation Fund de Equitech Futures.

- **Versión viva con IA:** un Artifact de claude.ai publicado desde `dist/index.html`. Usa la cuenta de Claude de quien lo visita.
- **Versión sin IA:** cualquier copia de `index.html` (por ejemplo en GitHub Pages) funciona como guía completa: etapas, calculadora, pruebas, señales de alerta, seguridad y descarga del protocolo.

## Cómo se usa la página

1. **Guía.** La página abre con el destino y pregunta en qué etapa estás: a) apenas empiezo, b) ya tengo sustrato y micelio, c) ya inoculé, d) la bolsa ya está blanca, e) ya salieron hongos, f) tengo un problema. Cada etapa muestra solo su bloque: pasos cortos, una prueba verificable, qué hacer si sale mal, sus animaciones y, si quieres, el protocolo completo.
2. **Calculadora.** Escribes los gramos de sustrato seco y te da agua, cal, micelio y tiempo de microondas, en gramos y en medidas de cocina.
3. **Asistente (solo dentro de Claude).** Conversación con respuestas cortas y numeradas, glosario en línea, diagnóstico por foto, botón «Explícalo más simple» y animaciones que la IA puede mostrar arriba del chat. Si el visitante no da permiso, el chat se esconde y la guía sigue completa.
4. **Bitácora.** Registro validado de cada bolsa, guardado en el navegador de cada persona (sin cuenta). Cada quien descarga su archivo y lo envía a Fungi Mati; el dueño lo suma al dataset abierto desde la misma pestaña y exporta todo a CSV. Ver `data/README.md`.
5. **Descargar mi protocolo.** Un archivo HTML imprimible o TXT con tus cantidades, los pasos, las pruebas, la seguridad y (opcional) tu conversación, para usarlo en la cocina sin internet.
6. **Idiomas.** Inglés (la página siempre abre en inglés; se cambia en `config.json`, campo `idiomaInicial`) y español, más náhuatl, maya yucateco, purépecha y wixárika (ver «Lenguas indígenas»).

## Estructura

```
index.html                 Fuente de la página (HTML + CSS + JS vanilla, un solo archivo)
build.mjs                  Inyecta knowledge/ y config.json en index.html → dist/index.html
config.json                Valores editables sin tocar código (costo por bolsa, URL del repo)
knowledge/protocolo.md     Protocolo v2 (español e inglés). Es lo que recibe la IA en cada llamada
knowledge/FUENTES.md       Literatura que respalda cada cifra (APA 7) y decisiones pendientes
knowledge/instrucciones-ia.md  Reglas de conversación que se envían a la IA en el primer turno
knowledge/i18n/<código>.json   Textos de la interfaz: es, en, nah, yua, tsz, hch
data/README.md             Esquema del dataset abierto
docs/SPEC.md               Especificación original del proyecto
docs/protocolo-v1.md       Protocolo v1 (mayo de 2026), histórico
```

## Cómo correr el build

Necesitas Node 18 o más reciente. No hay dependencias.

```bash
node build.mjs
```

Escribe `dist/index.html` con todo el conocimiento incrustado. Ese archivo es el que se publica como Artifact. Para probar localmente, abre `dist/index.html` en el navegador: funciona como guía sin IA.

Si sirves la raíz del repositorio sin build (por ejemplo con GitHub Pages desde `main`), `index.html` lee los archivos de `knowledge/` y `config.json` por su cuenta. El flujo `.github/workflows/pages.yml` además publica `dist/` en GitHub Pages en cada push.

## Protocolo versión 2: qué cambió y por qué

La versión 1 (mayo de 2026) alimentó al primer tutor de IA, hecho en Botpress con modelos GPT de OpenAI e insertado en una página de Google Slides. El experimento W4 (15 a 18 de mayo de 2026, 16 voluntarios sin experiencia en cocinas reales) mostró que el chatbot explicaba bien el concepto pero fallaba al sostener la ejecución: cantidades sin báscula, vocabulario técnico, sellado de la bolsa, pasteurización que no pasteurizaba y cal equivocada. La v2 corrige eso y respalda cada cifra con literatura sobre *Pleurotus*:

| Tema | v1 | v2 | Por qué |
|---|---|---|---|
| Agua para pellets | 60 % del peso seco (1 kg → 600 ml) | 1.5 veces el peso seco (400 g → 600 ml; 1 kg → 1.5 L) + prueba del puño | Validado en W4: 60 % deja el pellet comprimido seco |
| Cal | 1 cucharada (10–15 g) por 5 L | 10 g por litro (1 %; 6 g = 2½ cucharaditas medidoras para 600 ml) + advertencia de cal viva contra cal hidratada | W4 usó 1 g/L; la literatura sitúa el óptimo en 1 % y, como el pellet absorbe toda el agua, queda en 1.5 % del peso seco (mejor rango: hasta 2 %). Hubo confusión con cal viva |
| Pasteurización de pellets | Verter agua caliente en la bolsa «pasteuriza e hidrata» | Protocolo B: hervir sumergido 15–20 min, o verter, tapar y aislar ≥ 1 h, siempre en olla. Nuevo Protocolo C de microondas | Verter sin aislar baja en minutos a 30–50 °C (zona de moho); agua hirviendo en bolsa delgada quema |
| Sellado | «Nudo simple, no muy apretado» | Bloque de oxígeno: razón, prueba del aire, 4–6 microperforaciones | Nudos apretados causaron olor agrio y pérdidas |
| Microondas | — | 15 min por kg de sustrato empapado, en tandas de máximo 1 kg (empírico) | Nuevo Protocolo C |
| Fibra | Hervir 1 h | Hervir 1 h | Material más crudo que el pellet |
| Micelio | ~6 meses a temperatura ambiente | Refrigerar (1–4 °C), salvo *P. djamor* | Bacterias oportunistas a temperatura ambiente |
| Medidas | Cucharada, puñado, pizca | Taza y cucharas medidoras rasas, botella de 600 ml, fracción del paquete de micelio (densidades editables en `config.json`) | Que cualquiera pueda replicarlas igual |
| Costo | ~10 USD | La página no muestra cifra hasta confirmarla; el FAQ dice que el sustrato puede ser residuo gratuito y el micelio se compra por peso | Había dos cifras distintas (10 y 30 USD) |
| Nuevo | — | Glosario en línea, identificación visual de materiales, escalado a cualquier cantidad, bloque de seguridad, seguimiento posinoculación, respuesta al miedo a la toxicidad | Vocabulario y miedo fueron barreras en W4 |

Las cifras validadas en W4 se conservaron salvo decisión explícita del autor (la cal pasó de 1 g/L a 10 g/L). Las diferencias pendientes están en `knowledge/FUENTES.md` como `TODO Robert:`; las decisiones tomadas, en su sección «Decisiones del autor».

## Cómo contribuir al protocolo

1. Abre un issue o un pull request que modifique `knowledge/protocolo.md`.
2. Toda cifra nueva necesita una de dos cosas: una referencia sobre *Pleurotus* agregada a `knowledge/FUENTES.md` (APA 7), o datos de cultivo de la bitácora.
3. Respeta los marcadores `<!-- es:id -->` y `<!-- en:id -->`: la página arma las fichas de cada etapa a partir de ellos. Cambia la sección en español y su equivalente en inglés.
4. Las líneas `TODO Robert:` son decisiones pendientes; no se muestran en la página ni se envían a la IA.
5. Corre `node build.mjs` y abre `dist/index.html` para revisar.

### Lenguas indígenas: cómo corregir una traducción

Los textos en náhuatl (`nah`), maya yucateco (`yua`), purépecha (`tsz`) y wixárika (`hch`) son **borradores generados por IA, pendientes de revisión por hablantes nativos**. La página lo dice en esa lengua y en español, y cada advertencia de seguridad se muestra siempre también en español.

Si hablas alguna de estas lenguas:

1. Abre `knowledge/i18n/<código>.json` (botón «Edit» en GitHub; no necesitas instalar nada).
2. Corrige el texto a la derecha de cada `"llave": "texto"`. No cambies las llaves ni lo que va entre llaves `{n}`, `{min}`, `{max}`, `{ml}`.
3. En `_meta`, cuando la revisión esté completa, cambia `"machineTranslated": true` a `false` y, si quieres, agrega `"reviewedBy": "tu nombre o comunidad"`.
4. Envía el pull request con una nota sobre tu variante (región o comunidad). Si prefieres no usar GitHub, abre un issue con tus correcciones en texto.

## Licencia

- **Código** (`index.html`, `build.mjs`, `.github/`): MIT. Ver `LICENSE`.
- **Contenido** (`knowledge/`, incluidos el protocolo, las fuentes y las traducciones) y el dataset abierto: Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0), https://creativecommons.org/licenses/by-sa/4.0/deed.es

---

## English

**From waste to food.** Fungi Mati is a free assistant that guides anyone, in their language and at any hour, through turning lignocellulosic waste (agave bagasse left over from tequila and mezcal, sawdust, spent coffee grounds, coconut coir) into edible *Pleurotus* oyster mushrooms, from choosing a substrate to harvest. It diagnoses problems from a photo and logs grow data for an open dataset. Built by Roberto Carlos Navarro Félix (Biotechnology Engineering, Tec de Monterrey, Guadalajara), with early support from Equitech Futures' RISE Innovation Fund.

- **Live AI version:** a claude.ai Artifact published from `dist/index.html`, using each visitor's own Claude account.
- **No-AI version:** any copy of `index.html` (e.g. GitHub Pages) works as a full guide: stages, calculator, tests, warning signs, safety, and a downloadable protocol.

**Using the page.** Pick your stage (a–f) and get only that block: short steps, a test you can check, what to do if it fails, animations, and the full protocol on demand. The calculator scales water, lime, spawn and microwave time to your amount of dry substrate, in grams and kitchen measures. With a Claude account you also get the AI chat (short numbered answers, inline glossary, photo diagnosis, "explain it more simply", animations the AI can show above the chat). The grow log works for everyone without an account: it is saved in each person's browser, people download their file and send it, and the owner adds it to the open dataset and exports CSV. "Download my protocol" saves a printable HTML or TXT file for offline use in the kitchen.

**Build.** Node 18+, no dependencies: `node build.mjs` writes `dist/index.html`.

**Protocol v2.** v1 (May 2026) fed the first AI tutor, built in Botpress, running on OpenAI's GPT models and embedded in a Google Slides page. The W4 kitchen experiment with 16 novice volunteers showed it failed at execution: amounts without a scale, jargon, bag sealing, a "pasteurization" that didn't pasteurize, and the wrong lime. v2 changes water to 1.5× dry weight with the fist test, lime to 10 g/L (1 %, the literature optimum) with a quicklime warning, uses only reproducible measures (measuring cups and spoons, 600 ml bottles, fractions of the spawn pack), refrigerates spawn, boils fiber 1 hour, replaces pour-in-the-bag with boil-or-insulate in a pot (plus a microwave protocol), adds the oxygen block (loose knot, air test, pinholes), and adds an inline glossary, material identification, scaling, a safety block, post-inoculation follow-up and a toxicity answer. Every figure is checked against *Pleurotus* literature in `knowledge/FUENTES.md`; where literature disagrees with a W4-validated figure, the validated figure stays and the discrepancy is flagged `TODO Robert:`.

**Contributing.** Edit `knowledge/protocolo.md` (keep the `<!-- es:id -->` / `<!-- en:id -->` markers and change both languages); back new figures with a *Pleurotus* reference in `knowledge/FUENTES.md`. Native speakers of Nahuatl, Yucatec Maya, Purépecha or Wixárika: the translations in `knowledge/i18n/` are AI drafts — please correct them by pull request (edit the values, not the keys or `{placeholders}`), or open an issue with your corrections.

**License.** Code: MIT (`LICENSE`). Content in `knowledge/` and the open dataset: CC BY-SA 4.0.
