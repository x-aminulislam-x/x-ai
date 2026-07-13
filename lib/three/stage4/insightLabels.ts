import { CardLabel } from './cardLabels';

/**
 * Content for the InsightFlowOverlay hover panel — intentionally
 * distinct from CARD_LABELS in cardLabels.ts, which drives the
 * in-canvas card text. Framed as surfaced insights, not raw metrics.
 */
const INSIGHT_LABELS: CardLabel[] = [
  {
    tag: 'INSIGHT_01',
    value: 'Pattern Confirmed',
    subtext: 'Recurring signal across regions',
    detail:
      'A consistent usage pattern was flagged across three independent clusters, pointing to a shared underlying driver rather than isolated noise.',
  },
  {
    tag: 'INSIGHT_02',
    value: 'Demand Shift',
    subtext: 'Early-stage trend detected',
    detail:
      'Traffic composition shifted over the past week, with a new segment now accounting for a disproportionate share of growth.',
  },
  {
    tag: 'INSIGHT_03',
    value: 'Risk Flagged',
    subtext: 'Threshold approaching',
    detail:
      'One pipeline is trending toward its historical failure threshold faster than usual, giving the team a window to intervene early.',
  },
  {
    tag: 'INSIGHT_04',
    value: 'Opportunity Found',
    subtext: 'Underused capacity',
    detail:
      'Several nodes run well under capacity during peak hours, pointing to a rebalancing opportunity the scheduler has not yet caught.',
  },
  {
    tag: 'INSIGHT_05',
    value: 'Behavior Change',
    subtext: 'Cohort diverging from baseline',
    detail:
      'A specific user cohort started diverging from its historical baseline, which usually precedes a broader shift in overall behavior.',
  },
  {
    tag: 'INSIGHT_06',
    value: 'Correlation Surfaced',
    subtext: 'Cross-metric linkage',
    detail:
      'Two previously unrelated metrics are now moving together with high confidence, hinting at a shared root cause worth investigating.',
  },
];

export function getInsightLabel(cardIndex: number): CardLabel {
  return INSIGHT_LABELS[cardIndex % INSIGHT_LABELS.length];
}
