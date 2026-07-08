import * as THREE from 'three';

// The update pipeline signature
export type UpdatePipelineTask = (elapsed: number, delta: number) => void;

export class AnimationLoop {
  private clock: THREE.Clock;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  // The update pipeline array
  public updates: UpdatePipelineTask[];
  private isRunning: boolean;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.clock = new THREE.Clock();
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.updates = [];
    this.isRunning = false;

    this.animate = this.animate.bind(this);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.getDelta(); // Clear initial delta lag
    requestAnimationFrame(this.animate);
  }

  public stop(): void {
    this.isRunning = false;
  }

  /**
   * The core loop runner. It never changes, regardless of how many
   * animation chunks (20-30+) are pushed into the pipeline.
   */
  private animate(): void {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate);

    const elapsed = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    // Execute everything in the pipeline array sequentially
    for (const update of this.updates) {
      update(elapsed, delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.stop();
    this.updates = [];
  }
}
