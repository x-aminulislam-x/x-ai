import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';
import { CardSlot } from './dashboardLayout';

export interface Pipeline {
  object: THREE.Line;
  update: (elapsed: number, revealProgress: number) => void;
}

/**
 * Builds a dashed, flowing line between each pair of grid-adjacent
 * card slots (horizontal + vertical neighbors only — no diagonals).
 * Uses slot layout rather than live stage-2 neighbor data, since
 * neighbors aren't populated yet at the moment cards are first built.
 */
export function generatePipelines(slots: CardSlot[]): Pipeline[] {
  const pipelines: Pipeline[] = [];
  const columns = STAGE4_CONFIG.CARD_COLUMNS;

  slots.forEach((slot, index) => {
    const isLastInRow = (index + 1) % columns === 0;

    const rightNeighbor = slots[index + 1];
    if (rightNeighbor && !isLastInRow) {
      pipelines.push(createPipeline(slot, rightNeighbor));
    }

    const belowNeighbor = slots[index + columns];
    if (belowNeighbor) {
      pipelines.push(createPipeline(slot, belowNeighbor));
    }
  });

  return pipelines;
}

function createPipeline(fromSlot: CardSlot, toSlot: CardSlot): Pipeline {
  const start = edgePoint(fromSlot, toSlot);
  const end = edgePoint(toSlot, fromSlot);

  const SEGMENTS = 24;
  const positions = new Float32Array(SEGMENTS * 3);

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    const point = new THREE.Vector3().lerpVectors(start, end, t);
    positions[i * 3 + 0] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineDashedMaterial({
    color: new THREE.Color('#5EEAD4'),
    transparent: true,
    opacity: 0,
    dashSize: 0.12,
    gapSize: 0.1,
  });

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.renderOrder = 0;

  return {
    object: line,
    update(elapsed: number, revealProgress: number) {
      material.opacity = revealProgress * 0.55;
      material.dashOffset = -elapsed * 0.6;
    },
  };
}

function edgePoint(from: CardSlot, to: CardSlot): THREE.Vector3 {
  const direction = new THREE.Vector3().subVectors(to.position, from.position).normalize();
  const halfExtent =
    Math.abs(direction.x) > Math.abs(direction.y) ? from.width / 2 : from.height / 2;

  return new THREE.Vector3(
    from.position.x + direction.x * halfExtent,
    from.position.y + direction.y * halfExtent,
    from.position.z
  );
}
