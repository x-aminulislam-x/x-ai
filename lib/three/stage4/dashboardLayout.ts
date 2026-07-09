import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';

export interface CardSlot {
  position: THREE.Vector3;
  width: number;
  height: number;
}

/**
 * Lays out card slots in a centered grid, same spirit as
 * stage3/grid.ts's generateGridAnchors.
 */
export function generateCardSlots(): CardSlot[] {
  const { CARD_COUNT, CARD_COLUMNS, CARD_WIDTH, CARD_HEIGHT, CARD_GAP_X, CARD_GAP_Y } =
    STAGE4_CONFIG;

  const columns = CARD_COLUMNS;
  const rows = Math.ceil(CARD_COUNT / columns);

  const stepX = CARD_WIDTH + CARD_GAP_X;
  const stepY = CARD_HEIGHT + CARD_GAP_Y;

  const offsetX = ((columns - 1) * stepX) / 2;
  const offsetY = ((rows - 1) * stepY) / 2;

  const slots: CardSlot[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (slots.length >= CARD_COUNT) return slots;

      slots.push({
        position: new THREE.Vector3(col * stepX - offsetX, offsetY - row * stepY, 0),
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });
    }
  }

  return slots;
}
