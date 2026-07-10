'use client';

import { useEffect, useRef, useState } from 'react';
import { createScene } from '../lib/three/scene';
import { scrollTimeline } from '../lib/three/stage2';
import { dashboardTimeline } from '../lib/three/stage4/dashboardTimeline';
import InsightFlowOverlay from './InsightFlowOverlay'; // Import our new overlay configuration

// Title should be gone well before particles finish organizing into the grid
const TITLE_FADE_END = 0.08;

export default function HeroSection() {
  const stage23Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!stage23Ref.current || !stage4Ref.current || !canvasRef.current) return;

    scrollTimeline.init(stage23Ref.current, {
      snapPoints: [0, 0.66, 1],
      end: 'bottom top', // NOT the last trigger — consume full 300vh, no subtraction
    });
    dashboardTimeline.init(stage4Ref.current, {
      snapPoints: [0, 0.6, 1],
      // no `end` override — stays 'bottom bottom', this IS the last trigger,
      // so it subtracts the one viewport here and only here
    });

    const app = createScene(canvasRef.current);

    const syncTitle = () => {
      const progress = scrollTimeline.getProgress();
      setTitleOpacity(1 - Math.min(progress / TITLE_FADE_END, 1));
      frameRef.current = requestAnimationFrame(syncTitle);
    };
    frameRef.current = requestAnimationFrame(syncTitle);

    return () => {
      cancelAnimationFrame(frameRef.current);
      scrollTimeline.dispose();
      dashboardTimeline.dispose();
      app.dispose();
    };
  }, []);

  return (
    <section className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050816]">
        <canvas ref={canvasRef} className="absolute block inset-0 h-full w-full" />

        {titleOpacity > 0 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: titleOpacity }}
          >
            <h1 className="text-5xl font-bold text-white tracking-tight">Data → Intelligence</h1>
          </div>
        )}

        <InsightFlowOverlay />
      </div>

      <div
        ref={stage23Ref}
        className="absolute top-0 left-0 h-[300vh] w-full pointer-events-none"
      />
      <div
        ref={stage4Ref}
        className="absolute top-[300vh] left-0 h-[200vh] w-full pointer-events-none"
      />
    </section>
  );
}
