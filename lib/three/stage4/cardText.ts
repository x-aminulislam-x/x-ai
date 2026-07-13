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
  mesh.userData.localRenderOrder = 2;

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

const CARD_PADDING_X = 0; // was 64 — tightened to give text more usable width
const VALUE_MAX_FONT_SIZE = 250;
const VALUE_MIN_FONT_SIZE = 120; // floor — below this it's better to accept tight tracking than shrink further
const VALUE_AVAILABLE_WIDTH = CANVAS_WIDTH - CARD_PADDING_X * 2;

function fitFontSize(ctx: CanvasRenderingContext2D, text: string): number {
  let size = VALUE_MAX_FONT_SIZE;
  while (size > VALUE_MIN_FONT_SIZE) {
    ctx.font = `700 ${size}px system-ui, -apple-system, sans-serif`;
    if (ctx.measureText(text).width <= VALUE_AVAILABLE_WIDTH) break;
    size -= 10;
  }
  return size;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  label: CardLabel,
  color: THREE.Color | string
): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const paddingX = CARD_PADDING_X;
  let currentY = 90;

  // 1. EYEBROW
  ctx.fillStyle = '#000000';
  ctx.font = '600 50px "JetBrains Mono", "Roboto Mono", monospace';
  ctx.letterSpacing = '5px';
  ctx.globalAlpha = 0.85;
  ctx.fillText(label.tag, paddingX, currentY);

  currentY += 110;

  const valueFontSize = fitFontSize(ctx, label.value);
  ctx.fillStyle = '#000000';
  ctx.font = `700 ${valueFontSize}px system-ui, -apple-system, sans-serif`;
  ctx.letterSpacing = '-4px';
  ctx.globalAlpha = 1.0;
  ctx.fillText(label.value, paddingX, currentY);

  currentY += Math.max(valueFontSize * 1.12, 200);

  // 3. SUBTEXT
  ctx.fillStyle = '#000000';
  ctx.font = '500 62px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.globalAlpha = 0.85;
  ctx.fillText(label.subtext, paddingX, currentY);
}
