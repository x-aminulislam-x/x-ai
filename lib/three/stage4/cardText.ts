// stage4/cardText.ts
import * as THREE from 'three';

export interface CardText {
  object: THREE.Mesh;
  update: (revealProgress: number, parentScale: THREE.Vector3) => void;
}

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;

// Position/size live in the seed mesh's LOCAL unit-plane space — same
// convention as aiIndicator.ts (parent geometry is a 1x1 PlaneGeometry).
const LOCAL_WIDTH = 0.8;
const LOCAL_Y = -0.06;

/**
 * Title + metric readout rendered onto a canvas texture. Lives as a child
 * of the card's seed mesh (so it tracks position automatically), but
 * counter-scales every frame against the seed's non-uniform width/height
 * so the text itself never stretches as the card grows into shape.
 */
export function createCardText(title: string, value: string, color: THREE.Color): CardText {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  drawText(ctx, title, value, color);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.anisotropy = 4;

  const aspect = CANVAS_HEIGHT / CANVAS_WIDTH;
  const geometry = new THREE.PlaneGeometry(LOCAL_WIDTH, LOCAL_WIDTH * aspect);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, LOCAL_Y, 0.002);
  mesh.renderOrder = 2;

  return {
    object: mesh,
    update(revealProgress: number, parentScale: THREE.Vector3) {
      material.opacity = revealProgress;

      const safeX = Math.max(parentScale.x, 0.0001);
      const safeY = Math.max(parentScale.y, 0.0001);
      mesh.scale.set(1 / safeX, 1 / safeY, 1);
    },
  };
}

function drawText(
  ctx: CanvasRenderingContext2D,
  title: string,
  value: string,
  color: THREE.Color
): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(title.toUpperCase(), CANVAS_WIDTH / 2, 90);

  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.font = '700 84px system-ui, -apple-system, sans-serif';
  ctx.fillText(value, CANVAS_WIDTH / 2, 190);
}
