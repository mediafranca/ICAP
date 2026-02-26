/**
 * ICAP Evaluation Types
 *
 * Extraído de pictos-net para su uso independiente en el repositorio MediaFranca/ICAP.
 *
 * ICAP: Image-Communication Accessibility Protocol
 * Alineado con el esquema oficial: https://github.com/mediafranca/ICAP
 */

// ICAP Hexagonal Dimensions (Manual Input - Likert 1-5)
// Order aligned with official ICAP schema (mediafranca/ICAP):
// Clarity, Recognizability, Semantic Transparency, Pragmatic Fit, Cultural Adequacy, Cognitive Accessibility
export interface EvaluationMetrics {
  clarity: number;
  recognizability: number;
  semantic_transparency: number;
  pragmatic_fit: number;
  cultural_adequacy: number;
  cognitive_accessibility: number;
  reasoning: string;
}
