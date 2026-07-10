'use client';

import { useEffect, useRef, useState } from 'react';
import { scrollTimeline } from '../lib/three/stage2';
import { cardInteraction } from '../lib/three/stage4/cardInteraction';
import { getCardLabel } from '../lib/three/stage4/cardLabels';

interface FlowStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  range: [number, number]; // [startProgress, endProgress]
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: 'ingest',
    title: '01 / Ingest Data',
    subtitle: 'Unified Vector Stream',
    description:
      'Capture multi-modal datastreams asynchronously. Raw unstructured nodes anchor in real-time, preparing for structural classification.',
    range: [0.0, 0.33],
  },
  {
    id: 'analyze',
    title: '02 / Analyze with AI',
    subtitle: 'Contextual Synthesis',
    description:
      'Neural pipelines trigger neighbor detection arrays. Spatial meshes bind isolated data clusters together via contextual relevance weights.',
    range: [0.33, 0.66],
  },
  {
    id: 'generate',
    title: '03 / Generate Insight',
    subtitle: 'Deterministic Layouts',
    description:
      'Clustered network coordinates morph seamlessly into actionable analytical card layers, formatting raw patterns into human decision models.',
    range: [0.66, 1.0],
  },
];

export default function InsightFlowOverlay() {
  const [hoveredCardIndex, setHoveredCardIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const updateProgress = () => {
      // Pull the current smoothly interpolated progress from your singleton timeline
      setProgress(scrollTimeline.getProgress());
      frameRef.current = requestAnimationFrame(updateProgress);
    };

    frameRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const syncWithCanvas = () => {
      setHoveredCardIndex(cardInteraction.hoveredCardIndex);
      frameRef.current = requestAnimationFrame(syncWithCanvas);
    };
    frameRef.current = requestAnimationFrame(syncWithCanvas);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const isActive = hoveredCardIndex !== -1;
  const label = isActive ? getCardLabel(hoveredCardIndex) : null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end px-12 lg:px-24">
      <div
        className="max-w-md space-y-4 text-right transition-all duration-300 ease-out"
        style={{
          opacity: isActive ? 1 : 0,
          filter: isActive ? 'blur(0px)' : 'blur(6px)',
          transform: `translateY(${isActive ? 0 : 8}px)`,
        }}
      >
        {label && (
          <>
            <span className="block font-mono text-xs tracking-widest text-teal-400/80 uppercase">
              {label.tag}
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-white">{label.value}</h2>
            <p className="text-sm leading-relaxed text-slate-400 font-normal">{label.subtext}</p>
            <p className="text-sm leading-relaxed text-slate-300 font-normal pt-3 border-t border-white/10">
              {label.detail}
            </p>
          </>
        )}
      </div>

      <div className="hidden md:flex flex-col items-end font-mono text-[10px] tracking-wider text-slate-500 space-y-1 bg-black/20 backdrop-blur-sm p-4 rounded border border-white/5 self-end mb-12">
        <div>SYS_STATUS: ACTIVE</div>
        <div>TIMELINE_DELTA: {progress.toFixed(4)}</div>
        <div>VECTOR_COUNT: 2500</div>
      </div>
    </div>
  );
}

// Simple math helper inside the file for fluid interpolation without bulky dependencies
function linearInterpolate(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}
