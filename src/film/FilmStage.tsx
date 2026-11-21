import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FilmPlane from "./FilmPlane";
import Fallback from "./Fallback";
import type { Film } from "../narrative/config";
import type { Story } from "./story";
import type { FrameStore } from "./frames";
import CameraFrame from "../ui/CameraFrame";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
const WEBGL = typeof window !== "undefined" && hasWebGL();

type Props = { film: Film; story: Story; store: FrameStore; id?: string; className?: string; children?: ReactNode };

// One pinned film: WebGL canvas (or 2D fallback), scrim, camera frame and the film's HTML overlay.
// The render loop only runs while the stage is on screen.
const FilmStage = forwardRef<HTMLElement, Props>(function FilmStage({ film, story, store, id, className, children }, ref) {
  const inner = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(film.key === "making");

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`film ${className || ""}`} ref={ref} id={id}>
      <div className="film-inner" ref={inner}>
        {WEBGL ? (
          <Canvas
            className="film-canvas"
            dpr={[1, 2]}
            frameloop={active ? "always" : "never"}
            gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.NoToneMapping;
              gl.outputColorSpace = THREE.LinearSRGBColorSpace;
            }}
            orthographic
          >
            <FilmPlane film={film} story={story} store={store} />
          </Canvas>
        ) : (
          <Fallback film={film} story={story} store={store} />
        )}
        <div className="scrim" />
        <CameraFrame film={film} story={story} />
        {children}
      </div>
    </section>
  );
});

export default FilmStage;
