'use client';

import { useEffect, useRef } from 'react';
import { createScene } from '../lib/three/scene';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = createScene(canvasRef.current);

    return () => {
      app.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />;
}
