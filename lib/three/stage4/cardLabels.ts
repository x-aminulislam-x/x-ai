// stage4/cardLabels.ts
export interface CardLabel {
  title: string;
  value: string;
}

/** Deterministic per-card readout, keyed by cardIndex. */
const CARD_LABELS: CardLabel[] = [
  { title: 'Model Accuracy', value: '98.2%' },
  { title: 'Requests / sec', value: '1.2K' },
  { title: 'Avg Latency', value: '42ms' },
  { title: 'Uptime', value: '99.98%' },
  { title: 'Active Agents', value: '24' },
  { title: 'Throughput', value: '3.4K/s' },
];

export function getCardLabel(cardIndex: number): CardLabel {
  return CARD_LABELS[cardIndex % CARD_LABELS.length];
}
