# ICAP: Evaluación de Calidad Pictográfica (CAA)

ICAP es una herramienta para evaluar **bibliotecas completas de pictogramas** exportadas desde [pictos.net](https://pictos.net), usando una rúbrica Likert de 6 dimensiones y visualización hexagonal.

La aplicación principal está en [`index.html`](index.html) y está pensada para publicarse en GitHub Pages desde la rama `main`.

## Estado actual del evaluador

- Flujo guiado en **3 pasos**.
- Entrada por `library dump` JSON.
- Evaluación enfocada en **bitmaps** (`row.bitmap`) solamente.
- Se excluyen imágenes `data:image/svg+xml` de forma intencional.
- Rúbrica 1-5 por dimensión + gráfico hexagonal + explicación dinámica por puntaje.

## Ejecución local

```bash
cd /Users/hspencer/Sites/ICAP
python3 -m http.server 4173
```

Abrir: `http://localhost:4173`

## Flujo de evaluación (UI)

### Paso 1. Cargar biblioteca

- Carga manual de JSON exportado desde pictos.net.
- Botón para cargar ejemplo: `examples/icap_50_v1_graph_2026-02-11.json`.
- Resumen de metadatos en tabla (`key` a la derecha, `value` a la izquierda).
- Navegación horizontal de pictogramas con flechas.

### Paso 2. Datos socio-demográficos

Se capturan una sola vez y se guardan en `localStorage`:

- Edad (rango)
- Género
- País / región
- Nivel educativo (opcional)
- Idioma principal
- Experiencia en CAA
- Contexto de evaluación
- Rol:
  - Persona con dificultades de comunicación oral (usuario de pictogramas)
  - Persona sin dificultades de comunicación oral
  - Familiar o cuidador de persona con dificultades de comunicación
  - Profesional CAA
- Consentimiento anonimizado

### Paso 3. Evaluación

#### 3.1 Comprensión pragmática (previa)

Antes de mostrar sliders:

- Se muestra el pictograma en foco.
- Pregunta abierta: **"¿Qué comunica este pictograma?"**
- Opciones:
  - Confirmar evaluación pragmática
  - Omitir comprensión pragmática

#### 3.2 Evaluación por dimensiones

- Pictograma a la izquierda.
- Sliders Likert (1-5) agrupados a la derecha.
- Cada dimensión tiene botón `?` con tooltip de definición.
- Zona inferior en 2 columnas:
  - Izquierda: gráfico hexagonal (CLA, REC, SEM, PRA, CUL, COG)
  - Derecha: puntaje por dimensión + texto de la rúbrica para ese nivel
- Navegación por ítems y exportación JSON desde botón de ícono en la parte superior derecha.

## Dimensiones ICAP

1. Claridad
2. Reconocibilidad
3. Transparencia semántica
4. Adecuación pragmática
5. Adecuación cultural
6. Accesibilidad cognitiva

Fuente de verdad de la rúbrica: [`data/rubric-scale-descriptions.json`](data/rubric-scale-descriptions.json)

## Formato de entrada esperado

El evaluador consume `payload.rows[]` y toma:

- `row.id` o `row.sourceRowId`
- `row.UTTERANCE` (o equivalentes)
- `row.bitmap` (imagen raster)

`row.bitmap` soporta:

- `data:image/jpeg;base64,...`
- `data:image/png;base64,...`
- `data:image/webp;base64,...`
- Base64 plano (se interpreta como JPEG)
- URL `http(s)`

No se procesan SVG para evaluación en esta versión.

## Exportación JSON

El export incluye:

- `library` (metadatos base)
- `evaluator` (perfil socio-demográfico)
- `summary` (avance, promedios globales y por dimensión)
- `items[]` con:
  - `comprension_pragmatica` (respondida/omitida/pendiente + texto)
  - `scores` por dimensión
  - `average`

Schema de export actual: `icap-library-evaluation-1.2.0`.

## Publicación en GitHub Pages (rama `main`)

### Opción simple (sin workflow)

1. Ir a `Settings > Pages` del repositorio.
2. En **Build and deployment** elegir:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Guardar.

Con esto, cada push a `main` publica automáticamente.

## Estructura relevante

```text
index.html
web/
  app.js
  styles.css
data/
  rubric-scale-descriptions.json
examples/
  icap_50_v1_graph_2026-02-11.json
frases.json
docs/
  rubric.md
```
