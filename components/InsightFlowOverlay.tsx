'use client';

import { useEffect, useRef, useState } from 'react';
import { PARTICLE_COLORS } from '../lib/three/constants';
import { cardInteraction } from '../lib/three/stage4/cardInteraction';
import { cardStackBounds } from '../lib/three/stage4/cardStackBounds';
import { getInsightLabel } from '../lib/three/stage4/insightLabels';

export default function InsightFlowOverlay() {
  const [hoveredCardIndex, setHoveredCardIndex] = useState(-1);
  const [cardsActive, setCardsActive] = useState(false);
  const [stackRightFraction, setStackRightFraction] = useState(0.32);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const sync = () => {
      setHoveredCardIndex(cardInteraction.hoveredCardIndex);
      setCardsActive(cardInteraction.cardsActive);
      setStackRightFraction(cardStackBounds.rightEdgeScreenFraction);
      frameRef.current = requestAnimationFrame(sync);
    };
    frameRef.current = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const isActive = cardsActive;
  const label = isActive ? getInsightLabel(hoveredCardIndex) : null;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none flex items-center justify-start pr-12"
      style={{ paddingLeft: `calc(${stackRightFraction * 100}vw + 250px)` }}
    >
      <div
        className="max-w-md space-y-4 text-left transition-all duration-300 ease-out"
        style={{
          opacity: isActive ? 1 : 0,
          filter: isActive ? 'blur(0px)' : 'blur(6px)',
          transform: `translateY(${isActive ? 0 : 8}px)`,
        }}
      >
        {label && (
          <>
            <span
              className="block font-mono text-xs tracking-widest uppercase"
              style={{
                color: PARTICLE_COLORS.primary,
              }}
            >
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
    </div>
  );
}
