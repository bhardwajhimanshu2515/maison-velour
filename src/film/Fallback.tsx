import { useEffect, useRef } from "react";
import { step, type Story } from "./story";
import { sample, type Film } from "../narrative/config";
import type { FrameStore } from "./frames";

// No-WebGL fallback: the same frame sequence drawn on a 2D canvas, same scroll maths.
export default function Fallback({ film, story, store }: { film: Film; story: Story; store: FrameStore }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      step(story, (now - last) / 1000);
      last = now;
      const c = ref.current;
      const img = store.nearest(Math.round(sample(film, story.smooth).frame));
      if (c && img) {
        const w = (c.width = c.clientWidth * Math.min(2, devicePixelRatio));
        const h = (c.height = c.clientHeight * Math.min(2, devicePixelRatio));
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        c.getContext("2d")!.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [film, story, store]);
  return <canvas ref={ref} className="film-canvas" />;
}
