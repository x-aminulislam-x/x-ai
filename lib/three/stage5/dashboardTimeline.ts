import { ScrollTimeline } from '../stage2/scrollTimeline';

/**
 * Independent progress source for the stage4 -> dashboard handoff morph,
 * so it doesn't interfere with stage4's own dashboardTimeline (which is
 * already pinned at 1 by the time this stage begins).
 */
export const dashboardHandoffTimeline = new ScrollTimeline();
