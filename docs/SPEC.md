# Especificación del proyecto (prompt original)

Este es el prompt con el que se construyó la versión 2 del asistente de Fungi Mati (octubre de 2026). Se guarda tal cual como especificación. Las decisiones de implementación que se apartan de él (porque así lo exigen los tipos del runtime de Artifacts) están anotadas al final.

---

## Contexto

Soy Roberto Carlos Navarro Félix (Robert), estudiante de Ingeniería en Biotecnología en el Tec de Monterrey campus Guadalajara. Llevo diez años cultivando hongos. Mi proyecto Fungi Mati convierte residuos lignocelulósicos (bagazo de agave, pellets de aserrín, bagazo de café, fibra de coco) en setas comestibles del género Pleurotus. En 2026 recibí un fondo temprano de Equitech Futures (RISE Innovation Fund) con el que construí un primer chatbot en Botpress embebido en Google Sites y corrí un experimento con voluntarios sin experiencia (15 a 18 de mayo de 2026). El chatbot demostró que explica bien el concepto pero falla al sostener la ejecución en una cocina real: cantidades sin báscula, vocabulario técnico, sellado de la bolsa, pasteurización que no pasteuriza, cal equivocada. Ahora quiero construir en serio lo que prometí: un asistente de IA gratuito que guíe a cualquier persona, en su idioma y a cualquier hora, desde la elección del sustrato hasta la cosecha, que diagnostique problemas y que registre datos de cultivo para publicar un dataset abierto.

## Lo que vas a construir

Una página web de un solo archivo HTML (`index.html`, sin framework, sin bundler, JavaScript vanilla, CSS inline) que se publica como Artifact de claude.ai usando la herramienta `Artifact` de esta sesión, y cuyo código fuente vive en este repositorio público de GitHub. El Artifact es la versión viva con IA; el repositorio es la fuente abierta. Una copia servida desde GitHub Pages debe seguir funcionando como guía sin IA.

La página usa las capacidades de runtime de Artifacts (lee el skill `artifact-capabilities` antes de escribir una línea de código y respeta sus tipos, que son la autoridad):

1. `sample` con `images: true`. Es el motor de la IA: la página le pregunta a Claude usando la cuenta del visitante. No hay system prompt; las instrucciones y la base de conocimiento van en un primer turno `user` que la página conserva siempre y re-envía en cada llamada. Las imágenes permiten que el usuario suba una foto de su bolsa para diagnóstico (micelio sano, contaminación verde o negra, exceso de humedad).
2. `db` con `user`. Para la bitácora de cultivo: cada usuario registra sus bolsas (fecha de inoculación, sustrato, gramos, agua, cal, tensión del nudo, perforaciones, ambiente, temperatura aproximada, fotos opcionales como texto descriptivo, estado al día 7, 14, 21, cosecha en gramos). Reglas: cada quien escribe solo sus propias bolsas bajo `data/users/{self}`, y además existe una colección `logs` de lectura general y escritura `interact` donde se guarda una copia anonimizada (sin id de usuario) para el dataset abierto. Yo, como dueño, leo todo con `ArtifactData` y lo exporto a CSV.
3. `downloads`. Al terminar una sesión de guía, la página ofrece "descargar mi protocolo personalizado" como archivo de texto o HTML imprimible, porque en el experimento la gente tomó screenshots de la conversación y los usó como manual en la cocina sin internet.

Diseña siempre para la ausencia: si `claude.use("sample")` resuelve `null` o rechaza `not_granted`, la página esconde el chat y sigue siendo útil como guía interactiva estática (ver sección "Funciona sin IA"). Nunca llames a `sample` al cargar ni en bucles; solo al dar clic en "Preguntar", "Diagnosticar" o "Enviar". Muestra "Pensando..." hasta que llegue el primer texto y ofrece un botón Detener con `AbortController` nuevo por llamada. Usa `cache: false` en cada turno de chat. Para el diagnóstico de fotos usa `modelTier: "default"`; para el chat normal también `"default"`; para clasificar la etapa del usuario o reescribir en lenguaje más simple usa `"quick"`.

## Para quién es

Tres perfiles, y la página debe funcionar para los tres sin que se estorben:

1. Principiante absoluto sin báscula ni termómetro, en una cocina normal, que compró un kit o un mini kit de Fungi Mati o consiguió pellets por su cuenta. Es el usuario principal.
2. Voluntario de un curso presencial (servicio social, escuela, comunidad) que consulta la IA antes y después del taller y debe registrar su bolsa en la bitácora.
3. Yo y futuros instructores, que necesitamos leer la bitácora y exportar datos.

Idiomas: español mexicano por defecto e inglés, con un selector que además ofrece náhuatl, maya yucateco, purépecha y wixárika (huichol, la lengua indígena de Jalisco). Para español e inglés, todo el texto estático de la página existe en ambos idiomas y lo escribes tú. Para las cuatro lenguas indígenas, el texto estático lo generas tú también (etiquetas de botones, títulos de etapa, las tarjetas de cada etapa, la calculadora y el bloque de seguridad), pero lo guardas en archivos separados `knowledge/i18n/<código>.json` con una nota visible en la página en ese idioma y en español: "traducción generada por IA, pendiente de revisión por hablantes nativos; si hablas esta lengua, ayúdanos a corregirla", con enlace al repositorio. En esas cuatro lenguas, cada advertencia de seguridad (cal viva, agua hirviendo, hongos con manchas verdes o negras) se muestra también en español debajo, siempre. La IA responde en el idioma en que le escriben y, cuando el selector está en una lengua indígena, la instrucción le pide responder en esa lengua con el término técnico en español entre paréntesis la primera vez que aparece. El README documenta cómo un hablante contribuye una corrección por pull request.

## Arquitectura conversacional (esto es lo que falló y hay que corregir)

El primer turno de la IA nunca vacía el protocolo completo. La página abre con el destino ("vas a convertir pellets de madera en setas comestibles en unas seis semanas") y pregunta en qué etapa está el usuario, con botones:

a) apenas empiezo y no tengo nada b) ya tengo sustrato y micelio c) ya inoculé y estoy incubando d) la bolsa ya está blanca e) ya salieron hongos f) tengo un problema (lleva a diagnóstico con foto)

Cada etapa carga solo su bloque. Las respuestas son cortas por defecto (3 a 5 pasos en lenguaje llano) y terminan ofreciendo "¿quieres el detalle de algún paso?" o "¿quieres saber por qué?". El porqué de cada paso se conserva siempre que el usuario lo pida: fue lo más valorado del primer chatbot. Los pasos se numeran.

Reglas de redacción que la instrucción a la IA debe imponer:

1. Glosario en línea: la primera vez que aparezca cada término va con su definición entre paréntesis, y después se usa normal. Términos obligatorios: micelio (la "raíz" blanca del hongo, funciona como la semilla), sustrato (el material donde crece), inocular (mezclar el micelio con el sustrato), colonizar (que el micelio se extienda y ponga blanco el sustrato), fructificar (que broten los hongos que se comen), pasteurizar (matar a los microbios competidores sin esterilizar todo), cuerpo fructífero (el hongo que se cosecha).
2. Modo sin báscula activado por defecto: toda cantidad se da en gramos y en referencia casera (taza, cucharadita, puñado, "del tamaño de una pelota de tenis").
3. Escalado automático: la IA pregunta cuánto sustrato tiene el usuario y recalcula todo a esa cantidad; nunca fija todo a 1 kg.
4. Identificación visual de materiales en texto: cómo se ve el micelio en grano (granos blancos como arroz o sorgo cubiertos de una capa algodonosa), cómo se ven los pellets (parecen croquetas de gato color café claro), cómo se ve la cal hidratada.
5. Antes de cualquier cantidad de cal, advertencia de seguridad obligatoria: debe ser cal hidratada (hidróxido de calcio, Ca(OH)2, también llamada cal apagada o cal para pintar), nunca cal viva (óxido de calcio, CaO), que reacciona con el agua liberando calor y puede hervir y salpicar. Explicar cómo distinguirlas en la ferretería y qué hacer si solo se tiene cal viva o ninguna (entonces la pasteurización debe ser térmica sostenida).
6. Nunca sugerir verter agua hirviendo directamente en una bolsa de plástico delgada; recomendar recipiente resistente al calor.
7. La IA enseña a decidir, no solo a seguir: cada bloque incluye una prueba verificable y qué hacer si sale mal.
8. Al cerrar el bloque de inoculación, ofrecer proactivamente el bloque de seguimiento (cada cuánto revisar, cómo se ve el micelio sano, temperatura y humedad objetivo, qué hacer si se contamina).
9. Responder proactivamente al miedo a la toxicidad: Pleurotus cultivado correctamente no es tóxico; cuándo desconfiar.
10. Nunca prometer imágenes que la página no puede mostrar. Cuando una explicación se beneficie de verlo, la IA llama a la herramienta `showAnimation` con el nombre de una de las nueve animaciones de la página y lo dice en una frase ("te lo muestro arriba"); fuera de esa lista, describe en texto.
11. Mantener la mención de la garantía de Mercado Libre: si el micelio comprado se contamina en los primeros 8 días, reclamar.

## Base de conocimiento (archivo `knowledge/protocolo.md`)

El punto de partida es mi protocolo bilingüe original, que va completo en el Apéndice A al final de este prompt (es el que alimentó al chatbot de Botpress en mayo de 2026). Ese protocolo tiene cosas buenas que se conservan (la tabla de especies con temperaturas, la distinción Protocolo A para sustratos fibrosos y Protocolo B para pellets y polvo, la garantía de Mercado Libre, la sección de sustrato agotado y las preguntas frecuentes) y tiene errores que el experimento W4 ya demostró. Tu trabajo es producir `knowledge/protocolo.md` como versión 2 del protocolo: en español, con una sección en inglés equivalente, reconciliando el Apéndice A con las correcciones de abajo y con literatura revisada. Este archivo se inyecta al HTML en el paso de build y es lo que la IA recibe en cada llamada.

Reglas de reconciliación. Donde el Apéndice A y la lista de correcciones se contradigan, manda la lista de correcciones, porque salió de la ejecución real con 16 voluntarios. Las contradicciones que ya detecté y que debes resolver así:

1. Agua para pellets. El Apéndice A dice 60 por ciento del peso seco (1 kg de pellet, 600 ml). Está mal para pellet comprimido: la cifra validada es 1.5 veces el peso seco (400 g de pellet, 600 ml; 1 kg, 1.5 L). Usa 1.5x en todo el documento y agrega la prueba del puño.
2. Cal. El Apéndice A dice 1 cucharada (10 a 15 g) por 5 litros, es decir 2 a 3 g por litro. La cifra validada es 1 g por litro. Usa 1 g por litro, con la equivalencia casera, y agrega la advertencia de cal viva contra cal hidratada que el Apéndice A no tiene.
3. Pasteurización de pellets. El Apéndice A dice verter el agua caliente con cal sobre el pellet dentro de la bolsa y que eso pasteuriza e hidrata a la vez. Verter y esperar sin aislar solo hidrata, y verter agua hirviendo en una bolsa delgada es riesgo de quemadura. Reemplázalo por el Protocolo B corregido (hervir el sustrato sumergido 15 a 20 minutos con cal en recipiente resistente, o verter, tapar y aislar al menos una hora) y agrega el Protocolo C de microondas escalado por peso.
4. Sellado. El Apéndice A dice "nudo simple, no muy apretado" sin razón ni prueba. Reemplázalo por el bloque canónico de oxígeno con la razón, la prueba del aire y las microperforaciones.
5. Costo por unidad. El Apéndice A dice unos 10 USD con micelio incluido; en otros materiales míos dije 30 USD. No inventes una cifra: deja `TODO Robert: confirmar costo por unidad` y en la página muestra el costo como rango editable desde un archivo de configuración.
6. Lo que el Apéndice A no tiene y debes agregar: glosario en línea, identificación visual de materiales, escalado automático, bloque de seguridad, bloque de seguimiento posinoculación con las condiciones objetivo, y la respuesta proactiva al miedo a la toxicidad.

Donde tengas una duda técnica que ni el Apéndice A ni las correcciones ni la literatura resuelvan, deja `TODO Robert:` en vez de inventar.

## Optimización con investigación

Antes de cerrar `knowledge/protocolo.md`, haz una pasada de literatura para respaldar o corregir cada cifra operativa del protocolo. Usa WebSearch y, si está disponible en la sesión, el conector Consensus. Reglas:

1. Solo literatura del género Pleurotus (y donde haya, de la especie P. ostreatus o P. ostreatus var. columbinus). No justifiques ningún parámetro extrapolando desde otro género; si solo encuentras evidencia en otro hongo, lo anotas como `TODO Robert:` y no lo usas de respaldo.
2. Prioriza artículos revisados por pares y manuales técnicos de instituciones reconocidas (FAO, universidades, centros de investigación en micología). Lo más reciente posible, con diversidad de fuentes; no cites la misma fuente para todo.
3. Parámetros que necesitan respaldo: tasa de inoculación (el 10 por ciento y el rango mínimo del 3 a 5 por ciento), humedad del sustrato objetivo y su relación con la proporción agua a pellet, dosis de cal hidratada y pH resultante, tiempo y temperatura de pasteurización en agua caliente y en microondas doméstico, temperatura y CO2 en incubación (el fundamento del nudo flojo), tiempo típico a colonización completa y a primera cosecha, condiciones de fructificación (luz, humedad relativa, intercambio de aire), número de oleadas, y las temperaturas de la tabla de especies del Apéndice A.
4. Si una fuente contradice una cifra validada en el experimento, no la cambies en silencio: deja la cifra validada, anota la discrepancia en `knowledge/FUENTES.md` y márcala como `TODO Robert:` para que yo decida. Cuando dos fuentes se contradigan entre sí, elige una sola cifra para todo el documento (pesa más la confiabilidad que la fecha) o cita ambas, pero nunca uses una en una sección y otra en otra.
5. Escribe `knowledge/FUENTES.md` con la lista de referencias en formato APA 7 (American Psychological Association, séptima edición) y, junto a cada parámetro del protocolo, la cita en formato (autor, año). En el protocolo que recibe la IA no van las citas (alargan las respuestas), pero la página tiene una sección "Fuentes" generada desde ese archivo, y la IA puede decir "esto está respaldado por literatura; ve la sección de fuentes" cuando le pregunten de dónde sale una cifra.
6. En el README documenta que el protocolo es versión 2, qué cambió respecto a la versión 1 y por qué (el experimento W4 y la literatura).

Contenido mínimo del protocolo versión 2, con los números que ya validé en el curso:

1. Especie recomendada para principiantes: Pleurotus ostreatus y P. ostreatus var. columbinus. Melena de león (Hericium erinaceus) como línea futura, no como protocolo.
2. Sustratos: pellets de aserrín o de bagazo de agave como estándar (se almacenan y estandarizan). Alternativas: bagazo de agave en fibra, bagazo de café, fibra de coco. Suplemento opcional al 20 por ciento con cascarilla de soya en pellets.
3. Hidratación: 1.5 veces el peso seco del pellet. Tabla: 200 g con 300 ml, 400 g con 600 ml, 500 g con 750 ml, 1 kg con 1.5 L. Equivalencia: 600 ml son unas dos tazas y media. Si se hierve el agua destapada, agregar un 5 por ciento extra por evaporación. Prueba del puño: aprieta un puñado con fuerza; deben salir una o dos gotas; si sale un chorro, hay demasiada agua (drenar o exprimir); si no sale nada y se desmorona seco, falta agua (agregar poco a poco).
4. Cal hidratada: 1 g por litro de agua. Para 600 ml, 0.6 g, que es una pizca (un octavo de cucharadita; una cucharadita rasa son 4 a 5 g). Su función: subir el pH a 11 o 12 para suprimir mohos y bacterias. No es opcional; sin cal, la pasteurización debe ser térmica sostenida.
5. Pasteurización. Protocolo B (estufa): sumergir y hervir el sustrato 15 a 20 minutos con cal, o verter agua con cal, tapar y mantener aislado (toalla, hielera) al menos una hora. Verter agua hirviendo y esperar sin aislar solo hidrata, no pasteuriza, porque la mezcla baja de temperatura en minutos y pasa horas en 30 a 50 grados, la zona donde crecen Trichoderma y bacterias. Protocolo C (microondas): escalado por peso; 8 a 10 minutos por kilo con el sustrato ya empapado, 4 a 5 minutos para 400 g. Dejar enfriar a temperatura ambiente antes de inocular (que no queme la mano).
6. Inoculación: 10 por ciento de micelio respecto al peso del sustrato húmedo. 400 g secos más 600 ml dan cerca de 1 kg húmedo, que pide unos 100 g de micelio, un puñado generoso. Manos lavadas, superficie limpia, recomendado cubrebocas y guantes; abrir la bolsa lo menos posible.
7. Sellado y oxígeno (bloque canónico, siempre con la razón): el micelio respira, consume oxígeno y suelta CO2. Regla: nudo flojo, la bolsa debe poder inflarse y desinflarse. Prueba: aprieta la bolsa con la mano, debe salir aire por el cuello del nudo. Micro perforaciones: 4 a 6 perforaciones de alfiler en la mitad superior, o nudo flojo; una de las dos siempre, nunca ninguna. Anti intuición explícita: tu instinto te dirá que cierres bien para que no entre contaminación; no lo hagas; un nudo apretado mata más cultivos que el aire del cuarto, y produce el olor agrio de las bacterias anaerobias.
8. Incubación: 24 a 28 grados, oscuridad, sin corrientes. Micelio sano: crecimiento blanco radial desde los puntos de micelio entre el día 5 y 7. Colonización completa típica: 14 a 21 días.
9. Señales de alerta: manchas verdes o negras son contaminación por otros hongos, desechar la bolsa, no intentar rescatar; olor fermentado o agrio es contaminación bacteriana por exceso de humedad o falta de oxígeno; micelio que no crece indica sustrato muy seco o micelio viejo; contaminación en los primeros 8 días, reclamar garantía al vendedor.
10. Fructificación: cuando la bolsa está blanca, abrir o cortar, luz indirecta, humedad alta (pulverizar las paredes del espacio, no la bolsa), aire fresco. Cosecha entre 25 y 35 días después de la inoculación, antes de que el sombrero se abra por completo. Una bolsa da 2 o 3 cosechas.
11. Seguridad: cal viva contra cal hidratada; agua hirviendo y recipientes; EPP mínimo; no consumir hongos con manchas verdes o negras ni olor agrio.

## Funciona sin IA

La página debe ser una guía completa aunque nadie consienta usar Claude: la misma selección de etapa con botones, las fichas de cada etapa generadas desde `knowledge/protocolo.md`, una calculadora de cantidades (el usuario mete gramos de sustrato seco y la página devuelve agua, cal, micelio, tiempo de microondas, todo en gramos y en medidas caseras), la prueba del puño y la prueba del aire como tarjetas, el bloque de señales de alerta y el botón de descarga del protocolo personalizado. La IA agrega conversación, diagnóstico por foto y respuestas a lo que la guía no anticipó.

## Bitácora y dataset abierto

Formulario de registro de bolsa con validación de campos (fechas reales, números en rango) para evitar lo que pasó en el experimento: fechas imposibles, tablas sin llenar y respuestas copiadas. Campos: identificador de bolsa, fecha de inoculación, especie, sustrato, gramos secos, agua en ml, cal en g, método de pasteurización, tensión del nudo (flojo o apretado), perforaciones (sí o no), ambiente de incubación, temperatura aproximada, estado día 7, estado día 14, estado día 21 (colonizado, parcial, contaminado, sin crecimiento), fecha de primera cosecha, gramos cosechados por oleada. Una vista "mis bolsas" por usuario y, para mí como dueño, una vista "todas las bolsas" con botón de exportar CSV mediante `downloads`. Nunca pongas datos semilla en el código; maneja la bitácora vacía.

## Diseño

Sobrio y legible en teléfono, que es donde se va a usar en una cocina: texto grande, mucho contraste, tipografía del sistema, modo claro y oscuro, gutter de 16 px, sin scroll horizontal. Una paleta corta a partir de un verde oscuro de hongo y un crema; nada de gradientes decorativos. El chat ocupa el ancho disponible en escritorio (el widget anterior era estrecho y la gente se quejó). Las ilustraciones van en SVG inline dibujadas por ti, sin logos ni personajes de terceros, y las que explican un movimiento o un cambio en el tiempo se animan con CSS o SMIL (sin librerías externas). Lista mínima de animaciones, cada una de 3 a 6 segundos en bucle, con un botón de pausa y respetando `prefers-reduced-motion`:

1. Hidratación: los pellets absorben agua y se expanden a aserrín; una línea de nivel muestra 400 g con 600 ml.
2. Prueba del puño: una mano aprieta un puñado de sustrato y salen una o dos gotas; dos variantes contrastadas, el chorro (demasiada agua) y el polvo que se desmorona (falta agua).
3. Pasteurización: una curva de temperatura contra tiempo que compara verter agua hirviendo sin tapar (baja en minutos a la zona de 30 a 50 grados, marcada como zona de moho) contra hervir 15 a 20 minutos o aislar tapado (se mantiene arriba).
4. Inoculación: el micelio en grano se distribuye por capas en la bolsa, con el 10 por ciento representado visualmente como un puñado.
5. Sellado y oxígeno: una bolsa con nudo flojo que se infla y desinfla con flechas de aire entrando y CO2 saliendo, junto a una bolsa con nudo apretado que se queda rígida y se pone gris con una burbuja de olor agrio; la prueba de apretar la bolsa y ver salir aire por el cuello.
6. Perforaciones: 4 a 6 pinchazos de alfiler apareciendo en la mitad superior de la bolsa.
7. Colonización: una línea de tiempo de 21 días en la que el blanco crece radialmente desde los puntos de micelio hasta cubrir la bolsa; una rama alterna muestra una mancha verde apareciendo el día 6 con la etiqueta "desechar".
8. Fructificación y cosecha: la bolsa abierta, los primordios creciendo hasta sombrero y la mano cortando antes de que el sombrero se abra del todo.
9. Identificación de materiales: tarjetas con el pellet (parecido a croqueta), el grano con micelio (arroz con capa algodonosa) y el saco de cal hidratada frente al de cal viva, con un contorno que parpadea en el elemento correcto.

Cada animación lleva una leyenda corta en el idioma activo y aparece dentro de la ficha de su etapa; la IA puede pedir a la página mostrarla usando una herramienta de `sample` (`showAnimation(nombre)`) cuando la respuesta la amerite, de modo que el chat sí entregue apoyo visual real y nunca prometa imágenes que no existen. Además declara la capacidad `assets` para que yo suba desde la página mis propios videos cortos y fotos reales de la granja (hasta 20 MiB por archivo) y se muestren en la ficha correspondiente junto a la animación; mientras no haya nada subido, la ficha solo muestra la animación.

## Repositorio

Estructura mínima: `index.html` (fuente), `knowledge/protocolo.md`, `build.mjs` (inyecta el Markdown en el HTML y escribe `dist/index.html`; el Artifact se publica desde `dist/`), `README.md` en español con sección en inglés (qué es Fungi Mati, cómo se usa la página, cómo correr el build, cómo contribuir al protocolo, licencia), `LICENSE` (MIT para el código; Creative Commons BY-SA 4.0 para `knowledge/`, indícalo en el README), `docs/SPEC.md` con este mismo prompt guardado como especificación, y `data/README.md` explicando el esquema del dataset abierto y que se publicará como CSV anonimizado. Commits pequeños con mensajes claros. No subas credenciales ni correos.

## Orden de trabajo

1. Lee el skill `artifact-capabilities` y los archivos `.d.ts` de `sample`, `db`, `user` y `downloads`.
2. Haz la pasada de literatura y escribe `knowledge/FUENTES.md`. Luego escribe `knowledge/protocolo.md` como versión 2 reconciliando el Apéndice A, las correcciones y las fuentes, con notas `TODO Robert:` donde haga falta.
3. Escribe `index.html` y `build.mjs`. Prueba el build.
4. Publica `dist/index.html` como Artifact declarando `capabilities: {sample: {images: true}, db: {rules: [...]}, user: {}, downloads: true, assets: {}}`. Abre el Artifact.
5. Haz la verificación funcional que pide el skill: una lectura `ArtifactData` de cada colección que la página escribe y una lectura con nivel menor para confirmar que las reglas ocultan lo que deben.
6. Escribe README, LICENSE, docs/SPEC.md y data/README.md. Haz commit y push.
7. Al final dime en pocas líneas qué probaste, qué no pudiste probar desde la sesión (por ejemplo el consentimiento del visitante y el diagnóstico por foto, que solo se ven desde un navegador), y qué `TODO Robert:` dejaste en el protocolo.

Si algo en este prompt contradice los tipos del runtime, mandan los tipos. Si algo técnico sobre cultivo te parece dudoso, no lo corrijas por tu cuenta: déjalo como `TODO Robert:` y sigue.

## Apéndice A

Apéndice A. Protocolo bilingüe original de Fungi Mati (versión 1, mayo 2026). El texto íntegro, tal como venía en este prompt, está en [`docs/protocolo-v1.md`](protocolo-v1.md). Recuerda que las cifras de agua, cal, pasteurización y sellado de ese apéndice están superadas por las reglas de reconciliación de arriba.

---

## Decisiones de implementación (dónde mandaron los tipos del runtime)

- **«Yo, como dueño, leo todo».** En el runtime de Artifacts, `data/users/<id>/` es privado **incluso para el dueño**. Por eso la vista «Todas las bolsas» y la exportación CSV leen la colección anónima `logs`, que contiene todos los campos de cada bolsa salvo el identificador de usuario y el nombre que la persona le puso a su bolsa. Abrir los registros privados al dueño requeriría una regla en `data/users` que haría visibles los datos de cada participante; no se hizo.
- **«Todas las bolsas» se muestra a quien puede editar** (`user.canEdit()`, nivel `admin`), para que también la vean instructores con rol de Editor.
- **`showAnimation` con `cache: false`.** Las llamadas con herramientas no se guardan en caché; el runtime acepta `cache: false` junto con `tools`. Si la vista no permite herramientas (`limits().tools` ausente), la IA escribe la marca `[[mostrar:nombre]]` y la página muestra la animación.
- **Clasificar la etapa** (`quick`) solo ocurre al dar clic en Enviar cuando la persona todavía no eligió etapa.
- **Descarga en GitHub Pages.** Fuera de Claude no existe `downloads`; ahí la página usa una descarga normal del navegador.
