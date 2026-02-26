/**
 * getEvaluationScore
 *
 * Extraído de pictos-net para su uso independiente en el repositorio MediaFranca/ICAP.
 * Calcula puntaje total, promedio y color de visualización a partir de EvaluationMetrics.
 */

import type { EvaluationMetrics } from '../types';

export interface EvaluationScore {
  total: number;
  average: number;
  color: string;
}

/**
 * Get evaluation score summary and color coding for a 1-5 Likert scale
 * Color mapping: >= 4.5 green, >= 3.5 lime, >= 2.5 yellow, >= 1.5 orange, else red
 */
export function getEvaluationScore(metrics: EvaluationMetrics | undefined): EvaluationScore {
  if (!metrics) return { total: 0, average: 0, color: '#64748b' };

  const {
    clarity,
    recognizability,
    semantic_transparency,
    pragmatic_fit,
    cultural_adequacy,
    cognitive_accessibility
  } = metrics;

  const total =
    clarity +
    recognizability +
    semantic_transparency +
    pragmatic_fit +
    cultural_adequacy +
    cognitive_accessibility;

  const average = total / 6;

  let color = '#64748b'; // default gray
  if (average >= 4.5) color = '#22c55e';      // verde oscuro (5)
  else if (average >= 3.5) color = '#84cc16'; // verde limón (4)
  else if (average >= 2.5) color = '#eab308'; // amarillo (3)
  else if (average >= 1.5) color = '#f97316'; // naranjo (2)
  else color = '#ef4444';                      // rojo (1)

  return { total, average, color };
}
