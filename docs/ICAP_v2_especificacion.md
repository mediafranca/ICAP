# ICAP v2 — Especificación de implementación

**Repositorio**: `mediafranca/ICAP`
**Versión objetivo**: `icap-library-evaluation-2.0.0` (actual: `1.2.0`)
**Autor de la especificación**: sesión de análisis PICTOS, julio 2026
**Estado**: propuesta para implementación

---

## 0. Cómo usar este documento

Este documento es un *brief* de implementación. Está escrito para ser entregado a un
agente de desarrollo o a quien programe la v2, y contiene: la arquitectura, los algoritmos
con sus umbrales, el esquema de datos, el flujo de interfaz y las decisiones que **no** deben
tomarse. Las cifras citadas provienen del análisis de los 13 pictogramas deportivos de
Olimpiadas Especiales Santiago 2027 y están marcadas por nivel de evidencia.

**Regla general para quien implemente**: cuando este documento diga *hipótesis a testear*,
la funcionalidad se construye pero **no** se reporta como puntaje validado en la interfaz;
se muestra como dato exploratorio y así etiquetado.

---

## 1. El problema que resuelve la v2

ICAP v1 tiene tres limitaciones estructurales:

1. **Todo es juicio humano en escala Likert.** Las 6 dimensiones se puntúan 1–5 a mano,
   incluidas propiedades que son estrictamente geométricas y que un script mide mejor,
   más rápido y con reproducibilidad perfecta.
2. **Evalúa ítems, no conjuntos.** Un tablero de CAA, una señalética o un set de disciplinas
   se usan como conjunto de alternativas simultáneas. Un pictograma puede ser perfectamente
   reconocible y aun así inservible si es confundible con su vecino. Ninguna dimensión de v1
   captura esto.
3. **La escala Likert descarta información.** «Le pongo 3 de 5» es menos informativo y menos
   reproducible que «deja de leerse bajo 8 píxeles». La segunda es una cantidad en unidades
   físicas.

La v2 corrige las tres con una sola decisión arquitectónica.

---

## 2. Decisión arquitectónica: tres capas por origen del dato

**El instrumento se separa según quién puede producir cada dato, no según qué mide.**

| Capa | Origen | Costo humano | Reproducibilidad |
|---|---|---|---|
| **A — Geométrica** | script sobre el bitmap/SVG | cero | perfecta |
| **B — Psicofísica** | umbral medido con slider por una persona | ~15 s por ítem por eje | alta (unidades físicas) |
| **C — Interpretativa** | juicio humano en Likert | ~45 s por ítem | moderada (requiere calibración) |
| **D — Familia** | script sobre el set completo | cero | perfecta |

Esto **reduce** la carga humana respecto de v1 (de 6 Likert + pregunta abierta a 3 Likert +
3 sliders) y **aumenta** la información obtenida. Es la justificación operativa del rediseño:
no es un instrumento más complejo, es uno mejor repartido.

### 2.1 Consecuencia: ya no hay hexágono

**No se debe construir un solo polígono de 9 ejes.** Un radar exige que todos los ejes sean
conmensurables; mezclar «σ=6,5 px» con «4 de 5 en adecuación cultural» en el mismo polígono
produce un área que no significa nada. Es un error de visualización, no una preferencia
estética.

**Reemplazo: ficha de tres bandas.**

```
┌─────────────────────────────────────────────────────────┐
│  [pictograma]     A · GEOMETRÍA        (barras + umbral) │
│                   ├ grosor de trazo    ███████░░  3,7 %  │
│                   ├ unidades           ████░░░░░  4      │
│                   ├ regiones cerradas  ░░░░░░░░░  0   ⚠  │
│                   └ contorno inferido  ██░░░░░░░  4,9 %  │
│                                                          │
│                   B · UMBRALES       (unidades físicas)  │
│                   ├ desenfoque         σ = 6,5 px        │
│                   ├ tamaño mínimo      8 px              │
│                   └ desplazamiento     125 px            │
│                                                          │
│                   C · JUICIO            (triángulo 1-5)  │
│                   semántica ▲ pragmática ▲ cultural      │
└─────────────────────────────────────────────────────────┘
```

Tres visualizaciones separadas, cada una con su unidad. La banda C sí puede ser un radar
—son tres Likert conmensurables— pero es un **triángulo**, no un hexágono.

---

## 3. Capa A — Dimensiones geométricas (automáticas)

Se calculan del `payload` sin intervención humana. Entrada: máscara binaria figura/fondo.

### 3.1 Extracción de la máscara

```
1. Detectar el soporte (disco, cuadro o fondo plano) por umbral de color.
2. Ajustar círculo/rectángulo por percentil 99,5 de distancia al centroide
   (robusto a soportes recortados).
3. Excluir un anillo interior de 3 px para descartar el borde antialiasado
   — SIN ESTO se detectan trazos falsos en el perímetro.
4. Figura = píxeles claros dentro del soporte, apertura morfológica 2×2.
5. Descartar componentes que abracen el perímetro (>0,80·radio) y sean
   <12 % de la tinta total: son artefactos de borde.
6. Normalizar por escala al diámetro de soporte de referencia (240 px).
```

**Advertencia de implementación**: los pasos 3 y 5 son obligatorios. Sin ellos, marcas con
trazos tangentes al borde reportan 1–2 unidades espurias.

### 3.2 Las cuatro métricas

| ID | Métrica | Cálculo | Umbral | Evidencia |
|---|---|---|---|---|
| **A1** | Grosor de trazo | mediana de `2·EDT` sobre el esqueleto, como % del diámetro | ≥ 4 % | **verificado** |
| **A2** | Unidades desligadas | componentes conexas ≥ 25 px | ≤ 3 | literatura |
| **A3** | Regiones cerradas | huecos topológicos del glifo | ≥ 1 | literatura |
| **A4** | Contorno inferido | árbol de expansión mínima entre componentes / largo del esqueleto | ≤ 10 % | hipótesis |

**A1 es el predictor con respaldo empírico más fuerte** (Spearman ρ=+0,79, p=0,001 contra
robustez de escala, n=13). Debe presentarse como el criterio principal de la capa.

**A2** se apoya en Palmer & Rock (1994): la *uniform connectedness* es la unidad primaria de
organización perceptual, anterior a los principios clásicos de agrupamiento. Coincide con el
ancla de nivel 5 de la rúbrica actual («2-3 formas simples y audaces»).

**A3 requiere honestidad en la interfaz.** Tiene respaldo experimental sólido en población
general (Kovács & Julesz 1993, *PNAS*; Elder & Zucker 1993; Marino & Scholl 2005) pero en
las 13 marcas analizadas su asociación con robustez **no alcanzó significancia**
(ρ=+0,44, p=0,13). Mostrarlo como advertencia, no como puntaje.

> **Nota conceptual que debe quedar en la documentación**: «región cerrada» (cierre
> topológico de contorno) **no es** el principio gestáltico de *closure* (completación
> perceptual de un contorno interrumpido). Son parientes, no sinónimos. La documentación de
> v1 no hace esta distinción y conviene corregirla.

### 3.3 Mapeo a la rúbrica existente

Las anclas verbales de v1 ya nombran cantidades. **No inventar umbrales nuevos donde la
rúbrica ya dice un número**:

| Dimensión v1 | Nivel | Texto de la rúbrica | Métrica v2 |
|---|---|---|---|
| Acc. Cognitiva | 5 | «utiliza 2-3 formas simples y audaces» | A2 ≤ 3 |
| Acc. Cognitiva | 1 | «altamente complejo con muchos elementos» | A2 > 12 |
| Claridad | 5 | «escala perfectamente a cualquier tamaño» | B2 |
| Claridad | 1 | «ilegible cuando se escala» | B2 |
| Claridad | criterio | «separación figura-fondo» | A3 |

Esto preserva continuidad con v1 y evita que la v2 parezca un instrumento distinto.

---

## 4. Capa B — Umbrales psicofísicos (slider humano)

### 4.1 Qué son

Lo que en la interfaz parece «un slider para graduar el desenfoque» es, en psicofísica, el
**método de ajuste**: el observador mueve un control hasta el punto de transición perceptual
y ese punto es el dato. Produce una cantidad en unidades físicas en lugar de una opinión
ordinal.

### 4.2 Los tres ejes, y por qué son tres

**Verificado (n=13): las tres manipulaciones no son redundantes.** Correlaciones de rango
entre ellas, ninguna significativa:

| par | ρ | p |
|---|---|---|
| desenfoque ↔ escala | −0,39 | 0,19 |
| desenfoque ↔ movimiento | +0,29 | 0,34 |
| escala ↔ movimiento | −0,22 | 0,47 |

Cada manipulación reordena la familia. Caso ilustrativo: *Natación Aguas Abiertas* empata en
3.er lugar de fragilidad al desenfoque (σ=6,5; los más frágiles son Triatlón 2,75 y Ciclismo
6,25) y es la **más robusta de las trece al desplazamiento** (125 px contra una mediana de
33) — sus ondas horizontales sobreviven un barrido horizontal. Un solo eje no habría
detectado esa disociación.

| ID | Manipulación | Control | Unidad | Simula |
|---|---|---|---|---|
| **B1** | Desenfoque gaussiano | slider σ | px | baja agudeza, distancia, desenfoque de imprenta |
| **B2** | Escala | slider tamaño de render | px de diagonal | reproducción pequeña, ícono de app, señalética lejana |
| **B3** | Desplazamiento | slider longitud de barrido direccional | px | lectura en movimiento, scroll, pictograma sobre vehículo |

### 4.3 Protocolo — esto es lo que más importa implementar bien

```
Por cada eje:
  1. TAREA, no preferencia. La pregunta NO es «¿hasta dónde te parece
     legible?» sino una tarea con respuesta verificable:
       B1/B2/B3 → «mueva el control hasta donde YA NO PUEDA NOMBRAR
                   qué muestra el pictograma»
     Registrar además la respuesta abierta en el punto de umbral: permite
     verificar que la persona nombró lo correcto antes de cruzar.

  2. DOBLE DIRECCIÓN (obligatorio). El método de ajuste tiene histéresis:
     el umbral difiere según se venga de nítido→degradado o al revés.
       pasada 1: desde legible hacia degradado  → u_desc
       pasada 2: desde degradado hacia legible  → u_asc
     Umbral reportado = (u_desc + u_asc) / 2
     Registrar AMBOS y su diferencia: |u_desc − u_asc| es un indicador
     de confianza del dato. Diferencias grandes = ítem ambiguo.

  3. PUNTO DE PARTIDA ALEATORIZADO entre ítems, para evitar anclaje.

  4. ORDEN DE ÍTEMS aleatorizado. Sin esto, el aprendizaje del set
     contamina los umbrales tardíos.
```

**Implementación técnica**: los tres efectos se aplican en `<canvas>` sobre el bitmap ya
cargado. Desenfoque y desplazamiento vía `ctx.filter = 'blur(Npx)'` y convolución
direccional; escala vía render a canvas pequeño y reescalado con
`imageSmoothingEnabled = true`. No requiere dependencias nuevas.

### 4.4 Muestreo — clave para la operatividad

**No pedir los tres umbrales para los 88 ítems de una biblioteca.** Los umbrales dependen
sobre todo del estilo gráfico, que es constante dentro de una familia. Protocolo:

- **Obligatorio**: umbrales en una submuestra aleatoria del **20 %** del set (mínimo 8 ítems).
- **Dirigido**: agregar los ítems que la capa A marca como extremos (peor A1, mayor A2).
- **Opcional**: set completo, para estudios de validación.

Con esto la evaluación de una biblioteca de 50 ítems cuesta ~10 ítems × 3 ejes × 2
pasadas ≈ 15 minutos de umbrales, no dos horas.

### 4.5 Ruta futura (no implementar en v2)

Si más adelante se requiere precisión estadística por ítem, la referencia es **QUEST**
(Watson & Pelli, 1983, doi:10.3758/bf03202828), procedimiento adaptativo bayesiano que
converge en muchos menos ensayos. Requiere modelo psicométrico y elección forzada; es
sobre-ingeniería para v2. **Empezar con método de ajuste.**

---

## 5. Capa C — Dimensiones interpretativas (Likert, irreducibles)

Estas **no se automatizan y no se debe intentar**. Requieren un ser humano con competencia
cultural y conocimiento del contexto de uso.

| ID | Dimensión | Se conserva de v1 |
|---|---|---|
| **C1** | Transparencia semántica | sí, sin cambios |
| **C2** | Adecuación pragmática | sí, sin cambios |
| **C3** | Adecuación cultural | sí, sin cambios (mantener opción N/A) |

Se conservan las descripciones operacionales de `data/rubric-scale-descriptions.json` para
estas tres dimensiones.

### 5.1 Qué pasa con las otras tres dimensiones de v1

- **Claridad** → migra a capa A (A1, A3) + capa B (B2). Deja de ser Likert.
- **Accesibilidad Cognitiva** → se divide: complejidad estructural a A2; carga de
  procesamiento queda cubierta por los umbrales B.
- **Reconocibilidad** → **es el cambio más elegante de la v2.** En v1 es un Likert
  («¿es reconocible?»). En v2 se convierte en la tarea de nombrado del protocolo B: el
  umbral de degradación al que la persona ya no puede nombrar el pictograma **es** su
  reconocibilidad, medida en unidades físicas. Se elimina como Likert.

La pregunta abierta de comprensión pragmática de v1 («¿Qué comunica este pictograma?») se
**conserva y se integra** al protocolo B como la respuesta verificadora del paso 1.

---

## 6. Capa D — Consistencia y discriminabilidad de familia

**Módulo nuevo. Es la contribución original de la v2 y el argumento de publicación.**

Va como **vista independiente** («Informe de biblioteca»), no como paso final del flujo
individual: se calcula en segundos sin intervención humana, y obligar al evaluador a
esperarlo no aporta nada.

### 6.1 D1 — Matriz de confusabilidad

El criterio que ningún instrumento de CAA evalúa hoy. Fundamento: **Duncan & Humphreys
(1989)** — la eficiencia de búsqueda visual depende de la similitud *entre distractores*, no
sólo de las propiedades del objetivo. En un tablero de CAA no basta reconocer: hay que
distinguir.

```
Algoritmo:
  1. Para cada ítem: silueta canónica = recorte al bounding box,
     normalización de extensión a 128×128, centrado.
  2. Para cada nivel σ ∈ {0, 4, 8, 12, 16}:
       desenfocar cada silueta
       vectorizar, restar media, normalizar L2
       M[i,j] = producto punto  (correlación cruzada normalizada)
  3. Reportar: media, p90 y máximo de los pares distintos.
  4. Marcar todo par con r > 0,60 a σ=8 como ALERTA DE CONFUSIÓN.
```

Resultado en el set de referencia (13 marcas SO2027): la confusabilidad media asciende de
0,083 sin degradación a 0,369 (σ=8) y 0,528 (σ=16). **Tres pares** superan 0,60; el peor es
*Natación* / *Natación Aguas Abiertas* con **r=0,94** — a distancia de lectura son
prácticamente el mismo estímulo.

**Presentación en interfaz**: matriz triangular con mapa de color, celdas sobre umbral
marcadas, y clic en la celda que muestre los dos pictogramas lado a lado degradados a σ=8.
Ese *side-by-side* es lo que convence a un diseñador.

### 6.2 D2 — Consistencia paradigmática

Mide lo que la tradición Aicher/DOT sí resolvió: que los signos se lean como miembros de un
mismo sistema. Coeficiente de variación intrafamilia de cada rasgo estructural.

| Rasgo | Cálculo | Umbral |
|---|---|---|
| Grosor de trazo | CV de A1 | < 25 % |
| Razón cabeza/figura | CV del diámetro del componente redondo desligado / diagonal | < 25 % |
| Ángulos cardinales | CV del % de tangentes del esqueleto en 0°/45°/90°/135° ±7,5° | < 25 % |
| Entropía angular | CV de la entropía normalizada del histograma de orientaciones | < 25 % |

En el set de referencia: 19 %, 20 %, 17 % y 7 % respectivamente — **todos bajo umbral**. El
sistema es paradigmáticamente coherente.

### 6.3 D3 — Ranking de fragilidad

Tabla ordenable por cada umbral de capa B (o su proxy computacional cuando no haya datos
humanos), marcando los ítems bajo cada piso. Permite responder «¿qué rediseño primero?».

### 6.4 El hallazgo que este módulo hace visible

En el set de referencia, D2 pasa con holgura y A1/A2/D1 fallan: **4 de 13** alcanzan el
grosor mínimo, **3 de 13** respetan el ancla de 3 unidades, **3 de 13** participan en un par
confundible. Cumplimiento mediano: **3,5 de 6 criterios**.

Es decir: **la coherencia de sistema y la accesibilidad cognitiva son objetivos distintos, y
optimizar el primero no produce el segundo.** El módulo D existe para hacer medible esa
distinción, que el linaje ISOTYPE → Múnich 1972 → AIGA/DOT nunca se planteó porque su usuario
modelo era un viajero neurotípico apurado, no una persona con discapacidad intelectual.

---

## 7. Puntaje agregado y compuerta de calidad

### 7.1 Corregir el promedio de v1

`meetsICAPThreshold` usa promedio ≥ 4,0 de las 6 dimensiones. **Un promedio permite
compensación**: un 5 en adecuación cultural tapa un 2 en claridad. Para un sistema de CAA eso
es riesgoso — un pictograma ilegible no se redime por ser culturalmente apropiado.

**Reemplazar por compuerta conjuntiva**:

```
elegible = (todas las métricas A cumplen su umbral)
        ∧ (todos los umbrales B superan su piso)
        ∧ (min(C1,C2,C3) ≥ 3)
        ∧ (promedio(C1,C2,C3) ≥ 4,0)
        ∧ (el ítem no participa en ningún par D1 con r > 0,60)
```

**No** reportar un número único que promedie capas con unidades distintas. El resultado es
un semáforo por capa más la lista de criterios incumplidos.

### 7.2 Umbrales por defecto (configurables)

```json
{
  "A1_grosor_min_pct": 4.0,
  "A2_unidades_max": 3,
  "A3_regiones_cerradas_min": 1,
  "A4_contorno_inferido_max_pct": 10.0,
  "B1_desenfoque_min_pct_diametro": 2.5,
  "B2_tamano_min_px": 24,
  "B3_desplazamiento_min_px": 20,
  "C_likert_piso": 3,
  "C_likert_promedio": 4.0,
  "D1_confusabilidad_max": 0.60,
  "D2_cv_max_pct": 25.0
}
```

**Estos valores son propuestas, no constantes validadas.** Provienen de las anclas verbales
de la rúbrica y de la literatura, no de optimización sobre datos de comportamiento. Deben ser
editables en la interfaz y quedar registrados en el export.

---

## 8. Esquema de export `icap-library-evaluation-2.0.0`

```json
{
  "schema": "icap-library-evaluation-2.0.0",
  "library":  { "...metadatos del dump de origen..." },
  "evaluator":{ "...perfil socio-demográfico de v1, sin cambios..." },
  "config":   { "umbrales": { "...sección 7.2..." },
                "muestreo_B": { "estrategia": "aleatorio_20pct_mas_extremos",
                                "n_items_con_umbral": 10 } },
  "items": [{
    "id": "…",
    "utterance": "…",
    "A": { "grosor_pct": 3.73, "unidades": 4, "regiones_cerradas": 0,
           "contorno_inferido_pct": 4.9, "cumple": [true,false,false,true] },
    "B": { "desenfoque":    { "u_desc": 6.75, "u_asc": 6.25, "umbral": 6.50,
                              "histeresis": 0.50, "nombrado": "alguien nadando" },
           "escala":        { "u_desc": 8, "u_asc": 9, "umbral": 8.5,
                              "histeresis": 1 },
           "desplazamiento":{ "u_desc": 120, "u_asc": 130, "umbral": 125,
                              "histeresis": 10 },
           "medido": true },
    "C": { "transparencia_semantica": 4, "adecuacion_pragmatica": 4,
           "adecuacion_cultural": null, "na": ["adecuacion_cultural"] },
    "elegible": false,
    "criterios_incumplidos": ["A2_unidades", "A3_regiones_cerradas", "D1_par_confundible"]
  }],
  "family": {
    "D1": { "sigma_evaluados": [0,4,8,12,16],
            "media_por_sigma": [0.083,0.211,0.369,0.472,0.528],
            "pares_alerta": [ {"a":"Natación","b":"Natación Aguas Abiertas","r":0.94} ] },
    "D2": { "cv_grosor_pct": 19.0, "cv_cabeza_pct": 20.0,
            "cv_cardinales_pct": 17.0, "cv_entropia_pct": 7.0, "cumple": true },
    "D3": { "ranking_fragilidad": [ {"id":"Triatlón","peor_eje":"desenfoque","valor":2.75} ] }
  },
  "summary": { "n_items": 13, "elegibles": 1,
               "cumplimiento_mediano_A": 2, "alertas_familia": 3 }
}
```

**Retrocompatibilidad**: incluir un bloque `legacy_v1` con las 6 dimensiones derivadas
(Claridad y Acc. Cognitiva calculadas de A/B según el mapeo de §3.3) para que las
evaluaciones v1 existentes sigan siendo comparables. Documentar que la derivación es
aproximada.

---

## 9. Flujo de interfaz

```
Paso 1 · Cargar biblioteca            (igual que v1)
   └─ al cargar: CAPA A y CAPA D se calculan automáticamente
      → mostrar de inmediato el Informe de biblioteca preliminar
      → esto da valor antes de pedir un solo dato humano

Paso 2 · Perfil del evaluador         (igual que v1, localStorage)

Paso 3 · Umbrales (capa B)            [NUEVO]
   └─ sólo sobre la submuestra (§4.4)
   └─ por ítem: 3 ejes × 2 pasadas, con tarea de nombrado
   └─ barra de progreso que indique cuántos ítems faltan

Paso 4 · Juicio (capa C)              [reducido: 3 Likert, antes 6]
   └─ conserva descripciones operacionales de la rúbrica
   └─ conserva opción N/A en adecuación cultural

Vista aparte · Informe de biblioteca  [NUEVO]
   └─ matriz D1 con celdas clicables → comparación lado a lado
   └─ tabla D2 de coeficientes de variación
   └─ ranking D3 de fragilidad
   └─ accesible en cualquier momento, no al final
```

### 9.1 Presupuesto de tiempo por biblioteca de 50 ítems

| Capa | Tiempo humano |
|---|---|
| A | 0 |
| B | ~15 min (10 ítems muestreados) |
| C | ~35 min (50 ítems × ~45 s) |
| D | 0 |
| **Total** | **~50 min** |

v1, con 6 Likert más pregunta abierta por ítem, cuesta más y entrega menos. **Ese es el
argumento de operatividad**: la v2 no es más pesada.

---

## 10. Qué NO hacer

1. **No** construir un radar único de 9 ejes. Unidades no conmensurables (§2.1).
2. **No** reportar un puntaje ICAP único promediando las cuatro capas.
3. **No** intentar automatizar C1–C3. La transparencia semántica, la adecuación pragmática y
   la cultural requieren juicio humano y competencia cultural.
4. **No** presentar A3 (regiones cerradas) como puntaje validado; es advertencia
   fundamentada en literatura pero sin significancia en el set de referencia (§3.2).
5. **No** pedir los tres umbrales para todos los ítems de una biblioteca grande (§4.4).
6. **No** omitir la doble pasada de histéresis. Un umbral de una sola dirección está sesgado
   y el sesgo es sistemático, no ruido.
7. **No** afirmar en la documentación que estos criterios están validados en población
   autista. **No lo están** (§11).
8. **No** eliminar la pregunta abierta de comprensión pragmática de v1: se integra al
   protocolo B como respuesta verificadora.

---

## 11. Limitaciones que deben quedar escritas en la documentación

1. **n=13.** El set de referencia es insuficiente para inferencia. Sólo A1 alcanza
   significancia estadística. La heurística deriva su validez de la literatura citada, con
   las 13 marcas como caso ilustrativo.
2. **Sin datos de comportamiento humano.** Los proxies computacionales de capa A y los
   umbrales simulados no son mediciones de comprensión. La capa B introduce medición humana
   real; su validación contra acierto y tiempo de respuesta está pendiente.
3. **El desenfoque gaussiano no modela la visión de baja agudeza.** Es una aproximación
   monocroma e isotrópica; no captura pérdida de contraste, escotomas ni déficits específicos.
4. **La evidencia autismo-específica sobre cierre gestáltico es escasa y mixta.** La
   afirmación de que el cierre sea *especialmente* costoso en autismo **no está establecida**
   (consistente con Huang et al. 2025). Lo que sí está establecido (Van der Hallen et al.
   2015, 56 estudios) es que el procesamiento global es **más lento**, no deficitario. El
   argumento correcto para accesibilidad es de **costo temporal**, no de incapacidad.
5. **Los umbrales de §7.2 no están calibrados empíricamente.**

---

## 12. Prioridad de implementación

| Orden | Componente | Esfuerzo | Justificación |
|---|---|---|---|
| 1 | Capa A + extracción de máscara | 2–3 días | base de todo lo demás; valor inmediato sin datos humanos |
| 2 | Módulo D (D1 + D2) | 2–3 días | contribución original; es el argumento de publicación |
| 3 | Compuerta conjuntiva (§7.1) | horas | corrige un riesgo real de v1 |
| 4 | Capa B con protocolo completo | 4–5 días | el cambio metodológico de fondo |
| 5 | Ficha de tres bandas | 2–3 días | requiere que 1, 2 y 4 existan |
| 6 | Export 2.0.0 + legacy | 1–2 días | último, cuando el modelo de datos esté estable |

**Empezar por 1 y 2**: producen resultados publicables sin necesidad de recoger un solo dato
humano nuevo, y validan la arquitectura antes de invertir en la interfaz de umbrales.

---

## 13. Referencias que fundamentan el instrumento

- Biederman, I., & Ju, G. (1988). Surface versus edge-based determinants of visual
  recognition. *Cognitive Psychology*, 20(1), 38–64. doi:10.1016/0010-0285(88)90024-2
- Duncan, J., & Humphreys, G. W. (1989). Visual search and stimulus similarity.
  *Psychological Review*, 96(3), 433–458. doi:10.1037/0033-295x.96.3.433 — *fundamenta D1*
- Elder, J., & Zucker, S. (1993). The effect of contour closure on the rapid discrimination
  of two-dimensional shapes. *Vision Research*, 33(7), 981–991. doi:10.1016/0042-6989(93)90080-g
- Huang, Y., et al. (2025). Local and global visual processing in autism: A systematic review
  and meta-analysis of neuroimaging studies. *JADD*. doi:10.1007/s10803-025-07061-x
- Kovács, I., & Julesz, B. (1993). A closed curve is much more than an incomplete one.
  *PNAS*, 90(16), 7495–7497. doi:10.1073/pnas.90.16.7495 — *fundamenta A3*
- Marino, A. C., & Scholl, B. J. (2005). The role of closure in defining the "objects" of
  object-based attention. *Perception & Psychophysics*, 67(7), 1140–1149. doi:10.3758/bf03193547
- Palmer, S., & Rock, I. (1994). Rethinking perceptual organization: The role of uniform
  connectedness. *Psychonomic Bulletin & Review*, 1(1), 29–55. doi:10.3758/bf03200760 —
  *fundamenta A2*
- Treisman, A., & Gelade, G. (1980). A feature-integration theory of attention.
  *Cognitive Psychology*, 12(1), 97–136. doi:10.1016/0010-0285(80)90005-5
- Van der Hallen, R., et al. (2015). Global processing takes time. *Psychological Bulletin*,
  141(3), 549–573. doi:10.1037/bul0000004
- Watson, A. B., & Pelli, D. G. (1983). QUEST: A Bayesian adaptive psychometric method.
  *Perception & Psychophysics*, 33(2), 113–120. doi:10.3758/bf03202828 — *ruta futura de capa B*

---

*Especificación derivada del análisis de los 13 pictogramas de disciplinas deportivas de
Olimpiadas Especiales Santiago 2027. Métricas reproducibles en `metricas_so2027_icap.csv`;
criterios en `heuristica_accesibilidad_familias.csv`.*
