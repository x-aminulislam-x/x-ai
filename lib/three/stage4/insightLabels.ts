import { CardLabel } from './cardLabels';

const INSIGHT_LABELS: CardLabel[] = [
  {
    tag: 'INSIGHT_01',
    value: 'Pattern Confirmed',
    subtext: 'Recurring signal across regions',
    detail:
      'A consistent usage pattern was flagged across three independent clusters, pointing to a shared underlying driver rather than isolated noise. Reviewing the synchronization logs and configuration states across these specific environments is highly recommended to determine if a unified infrastructure alignment is required.',
  },
  {
    tag: 'INSIGHT_02',
    value: 'Demand Shift',
    subtext: 'Early-stage trend detected',
    detail:
      'Traffic composition shifted over the past week, with a new segment now accounting for a disproportionate share of growth. If this current trajectory continues over the next sprint, existing capacity allocations may become misaligned, necessitating a proactive adjustment of our edge routing and resource distribution models.',
  },
  {
    tag: 'INSIGHT_03',
    value: 'Risk Flagged',
    subtext: 'Threshold approaching',
    detail:
      'One pipeline is trending toward its historical failure threshold faster than usual, giving the team a window to intervene early. Immediate inspection of telemetry data, queue depths, and localized resource bottlenecks is advised before the system triggers automated failover mechanisms or experiences degraded performance.',
  },
  {
    tag: 'INSIGHT_04',
    value: 'Opportunity Found',
    subtext: 'Underused capacity',
    detail:
      'Several nodes run well under capacity during peak hours, pointing to a rebalancing opportunity the scheduler has not yet caught. Tweaking the scheduling heuristics or manually redistributing background cron workloads could unlock significant cost efficiencies and reduce unnecessary strain on adjacent clusters.',
  },
  {
    tag: 'INSIGHT_05',
    value: 'Behavior Change',
    subtext: 'Cohort diverging from baseline',
    detail:
      'A specific user cohort started diverging from its historical baseline, which usually precedes a broader shift in overall behavior. Closely monitoring this cohort’s feature adoption rates and interaction telemetry over the next release cycle will be critical to determining if this is an isolated anomaly or the new baseline.',
  },
  {
    tag: 'INSIGHT_06',
    value: 'Correlation Surfaced',
    subtext: 'Cross-metric linkage',
    detail:
      'Two previously unrelated metrics are now moving together with high confidence, hinting at a shared root cause worth investigating. This unexpected lockstep behavior suggests a hidden downstream dependency or a shared third-party API bottleneck that could impact system stability if left unaddressed.',
  },
];
export function getInsightLabel(cardIndex: number): CardLabel {
  return INSIGHT_LABELS[cardIndex % INSIGHT_LABELS.length];
}
