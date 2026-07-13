'use client';

import { useEffect, useRef, useState } from 'react';
import { PARTICLE_COLORS } from '../lib/three/constants';
import { cardInteraction } from '../lib/three/stage4/cardInteraction';
import { cardStackBounds } from '../lib/three/stage4/cardStackBounds';
import { getInsightLabel } from '../lib/three/stage4/insightLabels';

export default function InsightFlowOverlay() {
  const [hoveredCardIndex, setHoveredCardIndex] = useState(0);
  const [cardsActive, setCardsActive] = useState(false);
  const [stackRightFraction, setStackRightFraction] = useState(0.32);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const sync = () => {
      // lastHoveredCardIndex defaults to 0 and is sticky — it's what
      // gives us "first card active by default, stays on last hover
      // after the pointer leaves" without touching hoveredCardIndex,
      // which the Dashboard Content hover highlight depends on staying
      // at -1 when nothing is actually under the pointer.
      setHoveredCardIndex(cardInteraction.lastHoveredCardIndex);
      setCardsActive(cardInteraction.cardsActive);
      setStackRightFraction(cardStackBounds.rightEdgeScreenFraction);
      frameRef.current = requestAnimationFrame(sync);
    };
    frameRef.current = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const isActive = cardsActive;
  const label = isActive ? getInsightLabel(hoveredCardIndex) : null;

  // The panel's left edge sits at paddingLeft (stack-relative vw + a
  // fixed offset). Whatever space is left between that edge and the
  // viewport's right edge (minus the pr-12 gutter) is all the width
  // the panel actually has — a fixed Tailwind class like max-w-md/xl
  // has no idea how much of that is left, so on narrower viewports (or
  // when stackRightFraction is large) the panel was wider than its
  // remaining space and got silently clipped by the parent's
  // overflow-hidden. min() caps it at a comfortable reading width but
  // never lets it exceed what's actually available.
  const leftOffsetVw = stackRightFraction * 100;
  const panelWidth = `min(32rem, calc(100vw - ${leftOffsetVw}vw - 250px - 48px - 3rem))`;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none flex items-center justify-start pr-12"
      style={{ paddingLeft: `calc(${stackRightFraction * 100}vw + 250px)` }}
    >
      <div
        className="space-y-4 text-left transition-all duration-300 ease-out"
        style={{
          width: panelWidth,
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
