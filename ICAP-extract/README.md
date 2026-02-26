# ICAP - Image-Communication Accessibility Protocol

Módulo extraído de [pictos-net](https://github.com/mediafranca/pictos-net) para integración en el repositorio independiente [mediafranca/ICAP](https://github.com/mediafranca/ICAP).

ICAP es una iniciativa de la red MediaFranca para la evaluación multidimensional de pictogramas de comunicación aumentativa y alternativa (CAA).

## Contenido de este directorio

Este directorio preserva la implementación de ICAP que existía en pictos-net, organizada para facilitar su portabilidad:

```
ICAP/
├── types.ts                    # Interfaz EvaluationMetrics (6 dimensiones Likert 1-5)
├── corpus/
│   └── canonicalData.ts       # Corpus ICAP-50 (50 frases, 8 categorías pragmáticas)
├── services/
│   └── icapService.ts         # calculateICAPAverage, buildICAPMetadata, meetsICAPThreshold
├── components/
│   └── HexagonChart.tsx       # Componente React de visualización hexagonal
└── utils/
    └── getEvaluationScore.ts  # Helper de puntaje y codificación de color
```

El schema de validación vive en el repositorio oficial:
[https://github.com/mediafranca/ICAP](https://github.com/mediafranca/ICAP)

## Dimensiones ICAP

Las 6 dimensiones en escala Likert 1-5, alineadas con el esquema oficial:

| Código | Dimensión | Descripción |
|--------|-----------|-------------|
| CLA | Clarity | Claridad visual y legibilidad |
| REC | Recognizability | Facilidad de reconocimiento |
| SEM | Semantic Transparency | Transparencia semántica |
| PRA | Pragmatic Fit | Adecuación pragmática en contextos CAA |
| CUL | Cultural Adequacy | Adecuación cultural y lingüística |
| COG | Cognitive Accessibility | Accesibilidad cognitiva |

## Corpus ICAP-50

50 frases distribuidas en 8 categorías pragmáticas:
SOLICITAR, RECHAZAR, DIRIGIR, ACEPTAR, INTERACCIÓN SOCIAL, EMOCIÓN, COMENTAR, PREGUNTAR.

Endpoint externo: `https://mediafranca.github.io/ICAP/frases.json`

## Instrucciones de integración

1. Copiar este directorio al repositorio destino
2. Ajustar el import de `RowData` en `corpus/canonicalData.ts` al tipo equivalente del repo destino
3. El componente `HexagonChart.tsx` requiere React y Tailwind CSS
4. El esquema JSON de validación se mantiene en `schemas/ICAP` (submodule de mediafranca/ICAP)

## Historial

Extraído de pictos-net en febrero de 2026 para modularización de la iniciativa MediaFranca.
La evaluación ICAP ya no es un requisito de calidad interno en pictos-net; el módulo opera
como herramienta de investigación independiente en el repositorio mediafranca/ICAP.
