/**
 * HexagonChart Component
 *
 * Extraído de pictos-net para su uso independiente en el repositorio MediaFranca/ICAP.
 * Visualización hexagonal de las 6 dimensiones ICAP en escala Likert 1-5.
 *
 * Dependencias: React, useMemo
 * Tipo: EvaluationMetrics (importar desde ../types)
 */

import React, { useMemo } from 'react';
import type { EvaluationMetrics } from '../types';

interface HexagonChartProps {
  metrics: EvaluationMetrics;
  size?: number;
}

// Axis order aligned with official ICAP schema (mediafranca/ICAP)
const AXES = [
  'clarity',
  'recognizability',
  'semantic_transparency',
  'pragmatic_fit',
  'cultural_adequacy',
  'cognitive_accessibility'
] as const;

const LABELS = ['CLA', 'REC', 'SEM', 'PRA', 'CUL', 'COG'];

export const HexagonChart: React.FC<HexagonChartProps> = ({ metrics, size = 180 }) => {
  const center = size / 2;
  const radius = size * 0.40;

  const getPoint = (value: number, index: number) => {
    // Value is 1-5. 0 would be center, 5 is radius.
    const normalized = value / 5;
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const r = normalized * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const points = AXES.map((axis, i) => {
    const val = (metrics as any)[axis] || 0;
    const { x, y } = getPoint(val, i);
    return `${x},${y}`;
  }).join(' ');

  // Generate grid rings for 1, 2, 3, 4, 5
  const rings = [1, 2, 3, 4, 5].map(level =>
    AXES.map((_, i) => {
      const { x, y } = getPoint(level, i);
      return `${x},${y}`;
    }).join(' ')
  );

  const average = useMemo(() => {
    let sum = 0;
    AXES.forEach(a => sum += ((metrics as any)[a] || 0));
    return (sum / 6).toFixed(1);
  }, [metrics]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Rings */}
        {rings.map((ringPoints, i) => (
          <polygon
            key={i}
            points={ringPoints}
            fill={i === 4 ? "#f8fafc" : "none"}
            stroke={i === 4 ? "#cbd5e1" : "#e2e8f0"}
            strokeWidth="1"
            strokeDasharray={i === 4 ? "0" : "2 2"}
          />
        ))}

        {/* Data Hexagon */}
        <polygon points={points} fill="rgba(76, 29, 149, 0.2)" stroke="#4c1d95" strokeWidth="2" />

        {/* Labels */}
        {AXES.map((_, i) => {
          const labelAngle = (Math.PI / 3) * i - Math.PI / 2;
          const lx = center + (radius + 15) * Math.cos(labelAngle);
          const ly = center + (radius + 15) * Math.sin(labelAngle);
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.05}
              fontWeight="bold"
              fill="#64748b"
            >
              {LABELS[i]}
            </text>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ICAP</div>
          <div className="text-2xl font-bold text-violet-950 leading-none">{average}</div>
        </div>
      </div>
    </div>
  );
};
