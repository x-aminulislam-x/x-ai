'use client';

import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 6000; // how long the person needs to be idle/watching before this appears
const VISIBLE_DURATION_MS = 8000;

export default function IllusionHint({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    const showTimer = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(showTimer);
  }, [visible]);

  useEffect(() => {
    if (!show) return;
    const hideTimer = setTimeout(() => setShow(false), VISIBLE_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, [show]);

  if (!visible || !show) return null;

  return (
    <div
      className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-sm text-center transition-opacity duration-700"
      style={{ opacity: show ? 1 : 0 }}
    >
      <p className="text-slate-300 font-mono text-[11px] tracking-widest uppercase">
        Keep watching
      </p>
      <p className="text-slate-500 text-[11px] normal-case tracking-normal mt-1">
        The flow can seem to reverse direction the longer you stare — that's an optical illusion,
        not the animation changing.
      </p>
    </div>
  );
}
