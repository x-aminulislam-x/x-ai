import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { MouseState } from '../inputs/mouse';

const raycaster = new THREE.Raycaster();
const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0);
const hitPoint = new THREE.Vector3();

export function isPointerOverAttractor(
  mouse: MouseState,
  camera: THREE.PerspectiveCamera
): boolean {
  sphere.radius = STAGE7_CONFIG.DISPLAY_RADIUS * STAGE7_CONFIG.OBJECT_HOVER_RADIUS_MARGIN;
  raycaster.setFromCamera(mouse.normalized, camera);
  return raycaster.ray.intersectSphere(sphere, hitPoint) !== null;
}
