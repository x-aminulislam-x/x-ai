import { ScrollTimeline } from '../stage2/scrollTimeline';

/**
 * Independent progress source for stage 7 — particles converging into
 * the Lorenz attractor. Doesn't interfere with any earlier timeline,
 * all of which are pinned at 0 or 1 by the time this stage runs.
 */
export const lorenzTimeline = new ScrollTimeline();
