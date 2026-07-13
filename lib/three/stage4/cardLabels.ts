// stage4/cardLabels.ts

export interface CardLabel {
  tag: string; // The monospace "eyebrow"
  value: string; // The massive primary metric
  subtext: string; // The muted descriptive text
  detail: string; // Longer blurb shown in the hover detail panel
}

const CARD_LABELS: CardLabel[] = [
  {
    tag: 'SYS_ACCURACY',
    value: '98.2%',
    subtext: 'Model Confidence Score',
    detail:
      'Weighted across every inference this session, factoring in calibration drift so the number reflects real-world reliability, not just raw precision.',
  },
  {
    tag: 'NET_VOLUME',
    value: '1.2K',
    subtext: 'Requests per second',
    detail:
      'Sustained throughput across all active edge nodes, smoothed over a rolling 60-second window to filter out momentary traffic spikes.',
  },
  {
    tag: 'SYS_LATENCY',
    value: '42ms',
    subtext: 'Average response time',
    detail:
      'End-to-end round trip from request ingestion to first token, measured at the p50 mark across the current cluster region.',
  },
  {
    tag: 'NET_UPTIME',
    value: '99.99%',
    subtext: 'Rolling 30-day availability',
    detail:
      'Tracked against a strict health-check interval, counting any node failover event that exceeds a two-second recovery window.',
  },
  {
    tag: 'AI_AGENTS',
    value: '24',
    subtext: 'Active concurrent nodes',
    detail:
      'Each node independently manages its own task queue, coordinating through the shared context layer to avoid duplicated work.',
  },
  {
    tag: 'IO_THROUGHPUT',
    value: '3.4GB/s',
    subtext: 'Data pipeline velocity',
    detail:
      'Combined read/write bandwidth across the ingestion layer, scaling automatically as new data sources are connected.',
  },
];

export function getCardLabel(cardIndex: number): CardLabel {
  return CARD_LABELS[cardIndex % CARD_LABELS.length];
}
