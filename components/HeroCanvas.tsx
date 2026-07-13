'use client';

import { useEffect, useRef, useState } from 'react';
import { STAGE6_CONFIG, STAGE7_CONFIG } from '../lib/three/constants';
import { createScene } from '../lib/three/scene';
import { scrollTimeline } from '../lib/three/stage2';
import { CARD_ACTIVATION_THRESHOLD, cardInteraction } from '../lib/three/stage4/cardInteraction';
import { dashboardTimeline } from '../lib/three/stage4/dashboardTimeline';
import { dashboardHandoffTimeline } from '../lib/three/stage5/dashboardTimeline';
import { reformTimeline } from '../lib/three/stage6';
import { lorenzTimeline } from '../lib/three/stage7';
import AttractorHint from './AttractorHint';
import CardsHint from './CardsHint';
import DashboardPreview from './DashboardPreview';
import IllusionHint from './IllusionHint';
import InsightFlowOverlay from './InsightFlowOverlay';

const TITLE_FADE_END = 0.08;
const CROSSFADE_START = 0.82;
const CROSSFADE_END = 1.0;

export default function HeroSection() {
  const stage23Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);
  const stage5Ref = useRef<HTMLDivElement>(null);
  const stage6Ref = useRef<HTMLDivElement>(null);
  const stage7Ref = useRef<HTMLDivElement>(null);
  const isLoopingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [titleOpacity, setTitleOpacity] = useState(1);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [dashboardOpacity, setDashboardOpacity] = useState(0);

  const [attractorFormed, setAttractorFormed] = useState(false);
  const [cardsHintVisible, setCardsHintVisible] = useState(false);

  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (
      !stage23Ref.current ||
      !stage4Ref.current ||
      !stage5Ref.current ||
      !stage6Ref.current ||
      !stage7Ref.current ||
      !canvasRef.current
    ) {
      return;
    }

    scrollTimeline.init(stage23Ref.current, {
      snapPoints: [0, 1],
      end: 'bottom top', // NOT the last trigger — consume full 300vh, no subtraction
    });
    dashboardTimeline.init(stage4Ref.current, {
      snapPoints: [0, 0.6, 1],
      end: 'bottom top',
    });

    dashboardHandoffTimeline.init(stage5Ref.current, {
      snapPoints: [0, 1],
      end: 'bottom top', // no longer the last trigger — stage6 is
    });

    reformTimeline.init(stage6Ref.current, {
      snapPoints: [0, 1],
      end: 'bottom top', // no longer the last trigger — stage7 is
    });

    const app = createScene(canvasRef.current);

    lorenzTimeline.init(stage7Ref.current, {
      snapPoints: [0, 0.901],
      // no `end` override — stays 'bottom bottom', now the final trigger
      onProgress: (progress, direction) => {
        if (progress < 0.999 || direction !== 1 || isLoopingRef.current) return;

        isLoopingRef.current = true;

        scrollTimeline.reset();
        dashboardTimeline.reset();
        dashboardHandoffTimeline.reset();
        reformTimeline.reset();
        lorenzTimeline.reset();
        app.resetView();

        const prevBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = prevBehavior;

        requestAnimationFrame(() => {
          isLoopingRef.current = false;
        });
      },
    });

    const sync = () => {
      setTitleOpacity(1 - Math.min(scrollTimeline.getProgress() / TITLE_FADE_END, 1));

      const handoffProgress = dashboardHandoffTimeline.getProgress();
      const forwardCrossfade = clamp01(
        (handoffProgress - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START)
      );

      const reformProgress = reformTimeline.getProgress();
      const reverseCrossfade = clamp01(reformProgress / STAGE6_CONFIG.CROSSFADE_REVERSE_END);

      // forwardCrossfade brings the DOM dashboard in; reverseCrossfade
      // then brings it back out as stage 6 begins, handing back to canvas.
      const combinedCrossfade = forwardCrossfade * (1 - reverseCrossfade);

      setCanvasOpacity(1 - combinedCrossfade);
      setDashboardOpacity(combinedCrossfade);
      setAttractorFormed(lorenzTimeline.getProgress() > STAGE7_CONFIG.DRAG_ENABLE_THRESHOLD);

      // inside sync(), before the requestAnimationFrame call
      const cardsActive =
        dashboardTimeline.getProgress() > CARD_ACTIVATION_THRESHOLD &&
        dashboardHandoffTimeline.getProgress() <= 0.001;
      setCardsHintVisible(cardsActive && cardInteraction.hoveredCardIndex === -1);

      frameRef.current = requestAnimationFrame(sync);
    };

    frameRef.current = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frameRef.current);
      scrollTimeline.dispose();
      dashboardTimeline.dispose();
      dashboardHandoffTimeline.dispose();
      reformTimeline.dispose();
      lorenzTimeline.dispose();
      app.dispose();
    };
  }, []);

  return (
    <section className="relative h-[1100vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute block inset-0 h-full w-full"
          style={{ opacity: canvasOpacity }}
        />

        {titleOpacity > 0 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: titleOpacity }}
          >
            <h1 className="text-5xl font-bold text-white tracking-tight">Data → Intelligence</h1>
          </div>
        )}

        <InsightFlowOverlay />
        <AttractorHint visible={attractorFormed} />
        <IllusionHint visible={attractorFormed} />
        <CardsHint visible={cardsHintVisible} />

        <div
          className="absolute inset-0 z-30"
          style={{
            opacity: dashboardOpacity,
            pointerEvents: dashboardOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <DashboardPreview revealed={dashboardOpacity > 0.05} />
        </div>
      </div>

      {/* Scroll-trigger markers — no visuals, just occupy scroll distance */}
      <div
        ref={stage23Ref}
        className="absolute top-0 left-0 h-[300vh] w-full pointer-events-none"
      />
      <div
        ref={stage4Ref}
        className="absolute top-[300vh] left-0 h-[200vh] w-full pointer-events-none"
      />
      <div
        ref={stage5Ref}
        className="absolute top-[500vh] left-0 h-[200vh] w-full pointer-events-none"
      />
      <div
        ref={stage6Ref}
        className="absolute top-[700vh] left-0 h-[200vh] w-full pointer-events-none"
      />
      <div
        ref={stage7Ref}
        className="absolute top-[900vh] left-0 h-[200vh] w-full pointer-events-none"
      />
    </section>
  );
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
