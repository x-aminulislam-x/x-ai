import { ScrollTimeline } from '../stage2/scrollTimeline';

/**
 * Independent progress source for the Stage 4 morph, so it doesn't
 * interfere with the stage2/3 scrollTimeline (which is already at 1
 * by the time stage 4 begins).
 */
export const dashboardTimeline = new ScrollTimeline();
