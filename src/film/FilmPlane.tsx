import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { step, type Story } from "./story";
import { sample, type Film } from "../narrative/config";
import type { FrameStore } from "./frames";

// The video itself, drawn as a full-screen WebGL plane. Code only moves, crops and grades the footage.
const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uImgAspect;
uniform float uZoom;
uniform float uFocusX;
uniform float uExposure;
uniform float uWarmth;

vec3 grade(vec3 c){
  // gentle filmic contrast + exposure, slight cool lift in shadows, warm highlights
  c *= uExposure;
  c = mix(c, c*c*(3.0-2.0*c), 0.18);
  float l = dot(c, vec3(0.299,0.587,0.114));
  c += vec3(-0.012, 0.0, 0.016) * (1.0 - l);
  c *= mix(vec3(1.0), vec3(1.04, 1.0, 0.95), uWarmth * l);
  return c;
}

void main(){
  float screenAspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  vec2 scale = vec2(1.0);
  if (screenAspect > uImgAspect) scale.y = uImgAspect / screenAspect;   // cover: crop top/bottom
  else scale.x = screenAspect / uImgAspect;                            // cover: crop sides
  scale /= uZoom;
  float cx = 0.5;
  if (scale.x < 1.0) cx = clamp(uFocusX, scale.x*0.5, 1.0 - scale.x*0.5);
  vec2 centre = vec2(cx, 0.5);
  vec2 st = centre + (uv - 0.5) * scale;
  vec3 col = texture2D(uTex, st).rgb;
  col = grade(col);
  // vignette
  vec2 q = vUv - 0.5;
  col *= 1.0 - smoothstep(0.35, 0.95, length(q * vec2(screenAspect > 1.0 ? 1.0 : 1.4, 1.0))) * 0.45;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function FilmPlane({ film, story, store }: { film: Film; story: Story; store: FrameStore }) {
  const { size } = useThree();
  const tex = useMemo(() => {
    const t = new THREE.Texture();
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, []);
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImgAspect: { value: 16 / 9 },
      uZoom: { value: 1 },
      uFocusX: { value: 0.5 },
      uExposure: { value: 1 },
      uWarmth: { value: 0.5 },
    }),
    [tex]
  );
  const focus = useRef(film.acts[0].focusX);

  useFrame((_, dt) => {
    step(story, dt);
    const s = sample(film, story.smooth);
    const img = store.nearest(Math.round(s.frame));
    if (img && img !== (tex.image as unknown)) {
      tex.image = img;
      tex.needsUpdate = true;
      uniforms.uImgAspect.value = img.naturalWidth / img.naturalHeight;
    }
    uniforms.uRes.value.set(size.width, size.height);
    // slow push-in inside every shot; the reset is hidden by the film's own cut
    const isLast = s.idx === film.acts.length - 1;
    uniforms.uZoom.value = 1.02 + film.push * (isLast ? 0.5 : 1) * s.local;
    // exposure bloom across each real cut (brightens the footage itself)
    if (film.bloomCuts) {
      const nearStart = s.idx > 0 ? Math.max(0, 1 - s.local / 0.06) : 0;
      const nearEnd = !isLast ? Math.max(0, 1 - (1 - s.local) / 0.06) : 0;
      const bloom = Math.max(nearStart, nearEnd);
      uniforms.uExposure.value = 1 + bloom * bloom * 0.35;
    }
    focus.current += (s.act.focusX - focus.current) * Math.min(1, dt * 4);
    uniforms.uFocusX.value = focus.current;
    uniforms.uWarmth.value = film.warmth[0] + (film.warmth[1] - film.warmth[0]) * s.filmProgress;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
