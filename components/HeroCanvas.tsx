'use client';

import { useEffect, useRef, useState } from 'react';
import { createScene } from '../lib/three/scene';
import { scrollTimeline } from '../lib/three/stage2';
import { dashboardTimeline } from '../lib/three/stage4/dashboardTimeline';
import DashboardPreview from '../lib/three/stage5/DashboardPreview';
import { dashboardHandoffTimeline } from '../lib/three/stage5/dashboardTimeline';
import InsightFlowOverlay from './InsightFlowOverlay';

const TITLE_FADE_END = 0.08;
const CROSSFADE_START = 0.82;
const CROSSFADE_END = 1.0;

export default function HeroSection() {
  const stage23Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);
  const stage5Ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [titleOpacity, setTitleOpacity] = useState(1);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [dashboardOpacity, setDashboardOpacity] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!stage23Ref.current || !stage4Ref.current || !stage5Ref.current || !canvasRef.current) {
      return;
    }

    // Chaining rule: every trigger except the LAST one uses end: 'bottom top'
    // (consumes its full height, no viewport subtraction). Only the final
    // trigger uses the default 'bottom bottom' (subtracts one viewport) —
    // that's what makes the total consumed scroll distance match the
    // section's actual pin duration (sectionHeight - 100vh) with no gaps
    // and no overrun. stage5 is now the last trigger in the chain.
    // scrollTimeline.init(stage23Ref.current, {
    //   snapPoints: [0, 0.33, 0.66, 1],
    //   end: 'bottom top',
    // });
    // dashboardTimeline.init(stage4Ref.current, {
    //   snapPoints: [0, 0.4, 0.6, 1],
    //   end: 'bottom top',
    // });

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
      // no `end` override — stays 'bottom bottom', the final trigger
    });

    const app = createScene(canvasRef.current);

    const sync = () => {
      setTitleOpacity(1 - Math.min(scrollTimeline.getProgress() / TITLE_FADE_END, 1));

      const handoffProgress = dashboardHandoffTimeline.getProgress();
      const crossfade = clamp01(
        (handoffProgress - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START)
      );
      setCanvasOpacity(1 - crossfade);
      setDashboardOpacity(crossfade);

      frameRef.current = requestAnimationFrame(sync);
    };
    frameRef.current = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frameRef.current);
      scrollTimeline.dispose();
      dashboardTimeline.dispose();
      dashboardHandoffTimeline.dispose();
      app.dispose();
    };
  }, []);

  return (
    <section className="relative h-[700vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050816]">
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
    </section>
  );
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
