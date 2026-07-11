import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollTimeline {
  /**
   * Single source of truth.
   * Value is always between 0 and 1.
   */
  private targetProgress = 0;
  private progress = 0;

  private timeline?: gsap.core.Timeline;

  /**
   * Returns the current normalized progress value.
   * Centralizing this allows for easy future scaling (e.g., lerping, clamping, easing).
   */
  public getProgress(): number {
    return this.progress;
  }

  public update(delta: number) {
    this.progress = gsap.utils.interpolate(
      this.progress,
      this.targetProgress,
      1 - Math.exp(-10 * delta)
    );
    if (Math.abs(this.progress - this.targetProgress) < 0.0005) {
      this.progress = this.targetProgress;
    }
  }

  init(trigger: HTMLElement, opts?: { snapPoints?: number[]; end?: string }) {
    if (this.timeline) return;

    this.timeline = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: opts?.end ?? 'bottom bottom', // default stays as-is
        scrub: true,
        invalidateOnRefresh: true,
        snap: opts?.snapPoints
          ? { snapTo: opts.snapPoints, duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut' }
          : undefined,
        onUpdate: self => {
          this.targetProgress = self.progress;
        },
      },
    });
  }

  dispose() {
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    this.timeline = undefined;
    this.progress = 0;
  }
}

export const scrollTimeline = new ScrollTimeline();
