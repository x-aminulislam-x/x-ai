import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uSize;
  uniform float uRadius;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uBlur;
  varying vec2 vUv;

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = sdRoundedBox(p, uSize * 0.5, uRadius);
    float aa = fwidth(d) * uBlur;
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`;

/**
 * Creates a single rounded-rectangle SDF material. uSize and uRadius
 * are both in the SAME local units the mesh's scale is set to, so the
 * rounding stays correct even as the card stretches non-uniformly.
 */
export function createRoundedRectMaterial(
  color: THREE.Color,
  initialSize: number,
  initialRadius: number,
  initialOpacity: number,
  blur = 1.5
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: new THREE.Vector2(initialSize, initialSize) },
      uRadius: { value: initialRadius },
      uColor: { value: color },
      uOpacity: { value: initialOpacity },
      uBlur: { value: blur },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
