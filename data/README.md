# Dataset abierto de Fungi Mati

Cada bolsa registrada en la bitácora de la página genera dos documentos:

1. **Registro privado** en `data/users/<id>/<bolsa>`: solo lo ve y lo edita la persona que lo escribió. Ni el dueño del proyecto puede leerlo (regla de la plataforma de Artifacts). Incluye el identificador de bolsa que eligió la persona.
2. **Copia anonimizada** en la colección `logs`: sin identificador de usuario, sin nombre de bolsa. Esta copia es la que forma el dataset abierto. Se actualiza cada vez que la persona edita su bolsa y se borra si la borra.

El dueño (o quien tenga nivel de edición en el Artifact) ve «Todas las bolsas» en la página y exporta CSV con el botón **Exportar CSV**. También se puede leer con las herramientas de datos del Artifact. El dataset se publicará periódicamente como CSV anonimizado en este directorio, bajo licencia CC BY-SA 4.0.

## Reglas de acceso declaradas

| Ruta | Leer | Escribir |
|---|---|---|
| raíz (todo lo demás) | `view` (cualquiera con acceso) | `admin` (editores y dueño) |
| `logs` | `view` | `interact` (Contributor o más) |
| `media` (fotos y videos de las fichas) | `view` | `admin` |
| `data/users/{self}` | solo la propia persona | la propia persona con nivel `interact` o más |

Nota: con `write: interact` en `logs`, un Contributor técnicamente podría modificar copias ajenas; la página nunca lo hace. Antes de publicar el CSV, revisar valores atípicos.

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
