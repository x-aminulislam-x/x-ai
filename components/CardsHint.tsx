'use client';

import { useEffect, useState } from 'react';

export default function CardsHint({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!visible) setDismissed(false);
  }, [visible]);

  if (!visible || dismissed) return null;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1 text-slate-300 font-mono text-[11px] tracking-widest uppercase">
      <div>Hover a card for details</div>
    </div>
  );
}
