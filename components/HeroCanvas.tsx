'use client';

import { useEffect, useRef } from 'react';
import { createScene } from '../lib/three/scene';
import { scrollTimeline } from '../lib/three/stage2';

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!heroRef.current || !canvasRef.current) return;

    scrollTimeline.init(heroRef.current);

    const app = createScene(canvasRef.current);

    return () => {
      scrollTimeline.dispose();
      app.dispose();
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute block inset-0 h-full w-full" />

        {/* Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-bold text-white">Data → Intelligence</h1>
        </div>
      </div>
    </section>
  );
}
