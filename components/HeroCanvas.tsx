'use client';

import { useEffect, useRef } from 'react';
import { createScene } from '../lib/three/scene';
import { scrollTimeline } from '../lib/three/stage2';
import { dashboardTimeline } from '../lib/three/stage4/dashboardTimeline';

export default function HeroSection() {
  const stage23Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stage23Ref.current || !stage4Ref.current || !canvasRef.current) return;

    scrollTimeline.init(stage23Ref.current);
    dashboardTimeline.init(stage4Ref.current);
    const app = createScene(canvasRef.current);

    return () => {
      scrollTimeline.dispose();
      dashboardTimeline.dispose();
      app.dispose();
    };
  }, []);

  return (
    <section className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute block inset-0 h-full w-full" />

        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-bold text-white">Data → Intelligence</h1>
        </div>
      </div>

      {/* Scroll-trigger markers — no visuals, just occupy scroll distance */}
      <div ref={stage23Ref} className="absolute top-0 left-0 h-[300vh] w-full" />
      <div ref={stage4Ref} className="absolute top-[300vh] left-0 h-[200vh] w-full" />
    </section>
  );
}
