# Dataset abierto de Fungi Mati

## Cómo llegan los datos

La bitácora de la página funciona para cualquier persona, sin cuenta:

1. **Cada voluntario** registra sus bolsas en la página. Se guardan en **su propio navegador** (no salen de su teléfono hasta que él decida).
2. Con **«Descargar mi bitácora (CSV)»** o **«Copiar para WhatsApp o correo»** envía su archivo a Fungi Mati. El archivo trae las columnas del dataset más `bagId`, el nombre que la persona le puso a cada bolsa (solo sirve para que ella misma restaure su bitácora en otro teléfono).
3. **El dueño** (o un editor del Artifact) abre la pestaña Bitácora, usa **«Sumar al dataset los archivos que te enviaron»** y elige uno o varios CSV. La página descarta `bagId` y guarda cada registro en la colección `logs`, sin datos de la persona. Si el mismo archivo se sube dos veces, no se duplica: cada registro tiene un `logId` fijo.
4. Las bolsas que registran el dueño o los miembros de su organización en Claude se suman a `logs` automáticamente al guardar.
5. **«Exportar CSV»** descarga el dataset completo. Se publicará periódicamente en este directorio como CSV anonimizado, bajo licencia CC BY-SA 4.0.

¿Por qué así? En los Artifacts de Claude solo los miembros de la organización del dueño pueden escribir datos compartidos; los visitantes por enlace público solo leen. Guardar en el navegador y enviar el archivo hace que la bitácora funcione para todos sin servidor ni costo.

Dónde enviar el archivo: se configura en `config.json` (`envioBitacora`). TODO Robert: definir correo, WhatsApp o formulario.

## Reglas de acceso declaradas

| Ruta | Leer | Escribir |
|---|---|---|
| raíz (todo lo demás) | `view` (cualquiera con acceso) | `admin` (editores y dueño) |
| `logs` | `view` | `interact` (Contributor o más) |
| `media` (fotos y videos de las fichas) | `view` | `admin` |
| `data/users/{self}` | solo la propia persona | la propia persona con nivel `interact` o más (la versión actual de la página ya no lo usa) |

Nota: con `write: interact` en `logs`, un miembro de la organización técnicamente podría modificar copias ajenas; la página nunca lo hace. Los archivos que envían los voluntarios no se validan contra la página al importarlos más allá del formato: antes de publicar el CSV, revisar valores atípicos.

## Columnas del CSV

| Columna | Tipo | Descripción |
|---|---|---|
| `logId` | texto | Identificador aleatorio de la copia anónima (no se relaciona con la persona) |
| `inoculationDate` | fecha AAAA-MM-DD | Fecha de inoculación (no futura, desde 2020) |
| `species` | `ostreatus` · `columbinus` · `pulmonarius` · `otra` | Especie (`columbinus` = *P. ostreatus* var. *columbinus*) |
| `substrate` | `pellet_aserrin` · `pellet_agave` · `fibra_agave` · `cafe` · `coco` · `otro` | Sustrato |
| `dryGrams` | número 50–20000 | Gramos de sustrato seco |
| `waterMl` | número 0–30000 | Agua en ml |
| `limeG` | número 0–100 | Cal hidratada en g |
| `method` | `hervir` · `aislar` · `microondas` · `verter` · `ninguno` | Método de pasteurización (`verter` = verter sin aislar) |
| `knot` | `flojo` · `apretado` | Tensión del nudo |
| `holes` | `si` · `no` | Microperforaciones |
| `env` | `closet` · `caja` · `cama` · `alacena` · `cuarto` · `otro` | Lugar de incubación |
| `tempC` | número 5–45 o vacío | Temperatura aproximada en °C |
| `d7`, `d14`, `d21` | `colonizado` · `parcial` · `contaminado` · `sin_crecimiento` o vacío | Estado a los 7, 14 y 21 días (solo se acepta si ya pasaron esos días) |
| `firstHarvestDate` | fecha o vacío | Primera cosecha (al menos 10 días después de inocular, no futura) |
| `flush1`…`flush4` | número 0–20000 o vacío | Gramos cosechados por oleada |
| `totalGrams` | número | Suma de oleadas |
| `group` | texto o vacío | Código de grupo o taller (lo escribe la persona; sirve para separar cursos) |
| `lang` | código | Idioma de la página al guardar (`es`, `en`, `nah`, `yua`, `tsz`, `hch`) |
| `updatedAt` | fecha-hora ISO | Última actualización |
| `notes` | texto o vacío | Descripción de fotos u observaciones; la página pide no escribir datos personales. Revisar antes de publicar |

## Validación en la página

Para evitar lo que pasó en el experimento W4 (fechas imposibles, tablas sin llenar, respuestas copiadas):

- Fechas reales: no futuras, no antes de 2020; estados de día 7, 14 o 21 solo si ya pasó ese tiempo; cosecha al menos 10 días después de inocular.
- Números dentro de rango; campos obligatorios: identificador, fecha, gramos, agua, cal.
- Identificador de bolsa único por persona.
- Avisos (que se pueden confirmar con un segundo clic): agua lejos de 1.5× para pellets, o un registro idéntico a otra bolsa de la misma persona.
