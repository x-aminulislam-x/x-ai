// stage4/cardText.ts
import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';
import { CardLabel } from './cardLabels';

export interface CardText {
  object: THREE.Mesh;
  update: (revealProgress: number, parentScale: THREE.Vector3) => void;
}

// Match canvas aspect to the card's real aspect ratio (3.2 : 2 = 1.6)
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 640;

// Text block now sized as a fraction of the ACTUAL card width/height
// (previously a fixed 0.8 regardless of card size — the root cause of
// the text looking tiny once cards reached full scale)
const LOCAL_WIDTH = STAGE4_CONFIG.CARD_WIDTH * 0.82;
const LOCAL_Y = 0;

export function createCardText(label: CardLabel, color: THREE.Color): CardText {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  drawText(ctx, label, color);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  const aspect = CANVAS_HEIGHT / CANVAS_WIDTH;
  const geometry = new THREE.PlaneGeometry(LOCAL_WIDTH, LOCAL_WIDTH * aspect);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, LOCAL_Y, 0.01);
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
  label: CardLabel,
  color: THREE.Color | string
): void {
  const threeColor = color instanceof THREE.Color ? color : new THREE.Color(color);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const paddingX = 64; // tighter, more premium margin (was 80 on a cramped layout)
  let currentY = 90;

  // 1. EYEBROW
  ctx.fillStyle = `#${threeColor.getHexString()}`;
  ctx.font = '600 32px "JetBrains Mono", "Roboto Mono", monospace';
  ctx.letterSpacing = '5px';
  ctx.globalAlpha = 0.85;
  ctx.fillText(label.tag, paddingX, currentY);

  currentY += 110;

  // 2. PRIMARY METRIC — subtle glow for a premium dashboard feel
  ctx.shadowColor = `#${threeColor.getHexString()}`;
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 176px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '-4px';
  ctx.globalAlpha = 1.0;
  ctx.fillText(label.value, paddingX, currentY);
  ctx.shadowBlur = 0;

  currentY += 210;

  // 3. SUBTEXT
  ctx.fillStyle = '#E2E8F0'; // brighter slate for legibility at this size
  ctx.font = '500 42px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.globalAlpha = 0.85;
  ctx.fillText(label.subtext, paddingX, currentY);
}
