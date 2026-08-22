const ioNoiseGlsl = /* glsl */ `
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float valueNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 local = fract(p);
    local = local * local * (3.0 - 2.0 * local);
    float n000 = hash31(cell + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(cell + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(cell + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(cell + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(cell + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(cell + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(cell + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(cell + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, local.x), mix(n010, n110, local.x), local.y),
      mix(mix(n001, n101, local.x), mix(n011, n111, local.x), local.y),
      local.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 4; octave++) {
      value += valueNoise(p) * amplitude;
      p = p * 2.03 + vec3(13.1, 7.7, 3.9);
      amplitude *= 0.48;
    }
    return value;
  }
`;

export const ioCoreVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vEnergy;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  ${ioNoiseGlsl}

  void main() {
    float slowNoise = fbm(normal * 3.15 + vec3(uTime * 0.24, -uTime * 0.17, uTime * 0.11));
    float current = sin((position.y + slowNoise * 0.65) * 11.0 - uTime * 2.1) * 0.5 + 0.5;
    float displacement = (slowNoise - 0.48) * 0.17 + current * 0.025;
    vec3 displaced = position + normal * displacement;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vEnergy = clamp(slowNoise * 0.75 + current * 0.45, 0.0, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const ioCoreFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vEnergy;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vWorldNormal, viewDirection), 0.0), 2.35);
    float veins = smoothstep(0.62, 0.9, sin(vEnergy * 16.0 - uTime * 2.4) * 0.5 + 0.5);
    float heartbeat = 0.88 + sin(uTime * 3.15) * 0.12;
    vec3 plasma = mix(uSecondaryColor, uColor, smoothstep(0.1, 0.9, vEnergy));
    vec3 hotCore = mix(plasma, vec3(1.0), 0.58 + veins * 0.35);
    vec3 hdrColor = hotCore * (0.74 + fresnel * 1.7 + veins * 0.62) * heartbeat;
    gl_FragColor = vec4(hdrColor, 1.0);
  }
`;

export const ioAuraVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vFlow;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  ${ioNoiseGlsl}

  void main() {
    float flow = fbm(normal * 3.7 + vec3(-uTime * 0.14, uTime * 0.21, uTime * 0.08));
    float wave = sin(normal.y * 13.0 + flow * 8.0 - uTime * 2.0);
    vec3 displaced = position + normal * ((flow - 0.5) * 0.16 + wave * 0.018);
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vFlow = flow + wave * 0.12;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const ioAuraFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vFlow;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(vWorldNormal, viewDirection)), 2.0);
    float filaments = smoothstep(0.66, 0.83, sin(vFlow * 22.0 - uTime * 2.8) * 0.5 + 0.5);
    float pulse = 0.76 + sin(uTime * 1.7 + vFlow * 5.0) * 0.24;
    vec3 color = mix(uSecondaryColor, uColor, vFlow) * (0.7 + fresnel * 1.55 + filaments * 0.95);
    float alpha = (fresnel * 0.26 + filaments * 0.11) * pulse;
    gl_FragColor = vec4(color, alpha);
  }
`;

export const ioParticleVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  varying float vPulse;

  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    vec3 animated = position;
    float speed = 0.11 + aPhase * 0.18;
    animated.xz = rotate2d(uTime * speed + aPhase * 6.28318) * animated.xz;
    animated.xy = rotate2d(sin(uTime * 0.13 + aPhase * 4.0) * 0.42) * animated.xy;
    float flow = sin(uTime * 1.4 + aPhase * 18.0 + length(animated) * 5.0);
    animated += normalize(animated) * flow * 0.075;
    animated.y += sin(uTime * 0.7 + animated.x * 3.5 + aPhase * 9.0) * 0.07;
    vPulse = 0.48 + 0.52 * sin(uTime * 2.2 + aPhase * 21.0);
    vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
    gl_PointSize = aSize * (0.68 + vPulse * 0.52) * (8.0 / -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const ioParticleFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vPulse;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float core = 1.0 - smoothstep(0.0, 0.13, distanceToCenter);
    vec3 color = mix(uSecondaryColor, uColor, vPulse) * 1.1 + core * vec3(1.15);
    gl_FragColor = vec4(color, halo * (0.45 + vPulse * 0.55));
  }
`;
