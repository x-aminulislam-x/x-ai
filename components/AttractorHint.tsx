'use client';

import { useEffect, useState } from 'react';

const DISMISS_GRACE_MS = 1200; // delay before dismiss listeners attach
const AUTO_HIDE_MS = 30000; // fallback: hide on its own if never interacted with

export default function AttractorHint({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [listenersReady, setListenersReady] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDismissed(false);
    setListenersReady(false);
    const t = setTimeout(() => setListenersReady(true), DISMISS_GRACE_MS);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (!visible || !listenersReady || dismissed) return;

    const dismiss = () => setDismissed(true);
    // Deliberately pointerdown only, NOT 'wheel' — wheel events fire
    // continuously during the ordinary page-scroll that carries someone
    // into this stage, so the previous version was dismissed by the
    // tail end of that same scroll gesture before it ever had a chance
    // to be seen.
    window.addEventListener('pointerdown', dismiss, { once: true });
    const hideTimer = setTimeout(dismiss, AUTO_HIDE_MS);

    return () => {
      window.removeEventListener('pointerdown', dismiss);
      clearTimeout(hideTimer);
    };
  }, [visible, listenersReady, dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1 text-slate-300 font-mono text-[11px] tracking-widest uppercase">
      <div>Drag to rotate · Scroll to zoom</div>
      <div className="text-slate-500 normal-case tracking-normal">
        Vertical axis stays upright as you orbit
      </div>
    </div>
  );
}
