/**
 * ICAP Evaluation Service
 *
 * Extraído de pictos-net para su uso independiente en el repositorio MediaFranca/ICAP.
 * Contiene la lógica de evaluación ICAP: cálculo de promedio y control de calidad.
 */

import type { EvaluationMetrics } from '../types';

/**
 * Calculate ICAP average score across 6 hexagonal dimensions
 */
export function calculateICAPAverage(eval_: EvaluationMetrics): number {
  const {
    clarity,
    recognizability,
    semantic_transparency,
    pragmatic_fit,
    cultural_adequacy,
    cognitive_accessibility
  } = eval_;
  return (
    clarity +
    recognizability +
    semantic_transparency +
    pragmatic_fit +
    cultural_adequacy +
    cognitive_accessibility
  ) / 6;
}

/**
 * Build ICAP metadata block for SVG provenance
 * Returns the icap object to embed in SVG <metadata>
 */
export function buildICAPMetadata(evaluation: EvaluationMetrics, author: string) {
  const avg = calculateICAPAverage(evaluation);
  return {
    validated: true,
    validatedAt: new Date().toISOString(),
    validator: author || "PictoNet",
    clarityScore: Math.round(evaluation.clarity),
    comments: evaluation.reasoning || `ICAP average: ${avg.toFixed(2)}`
  };
}

/**
 * ICAP quality gate: check if evaluation meets minimum score threshold
 * Threshold: ICAP average >= 4.0
 */
export function meetsICAPThreshold(
  evaluation: EvaluationMetrics,
  threshold: number = 4.0
): { eligible: boolean; average: number; reason?: string } {
  const average = calculateICAPAverage(evaluation);
  if (average < threshold) {
    return {
      eligible: false,
      average,
      reason: `ICAP average (${average.toFixed(2)}) must be >= ${threshold}`
    };
  }
  return { eligible: true, average };
}
