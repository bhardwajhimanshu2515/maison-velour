import type { Film } from "../narrative/config";

// Each film ships as one full-quality WebP per frame (frames/<prefix>d/001.webp …).
// Load order: one key frame per half-second first, then every third frame, then the rest,
// so scrubbing works anywhere early; the nearest decoded frame fills in until the exact one arrives.
// Phones use the same full-resolution frames: they crop hardest, so they need the most pixels.

export type FrameStore = {
  frames: (HTMLImageElement | null)[];
  load: (onProgress?: (loaded: number, total: number) => void) => Promise<void>;
  nearest: (i: number) => HTMLImageElement | null;
};

export function createFrameStore(film: Film): FrameStore {
  const frames: (HTMLImageElement | null)[] = new Array(film.frames).fill(null);
  let started: Promise<void> | null = null;

  const load = (onProgress?: (loaded: number, total: number) => void) => {
    if (started) return started;
    const base = import.meta.env.BASE_URL;
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => !seen.has(i) && (seen.add(i), order.push(i));
    for (let i = 0; i < film.frames; i += 12) push(i);
    for (let i = 0; i < film.frames; i += 3) push(i);
    for (let i = 0; i < film.frames; i++) push(i);

    let loaded = 0;
    let cursor = 0;
    started = new Promise<void>((resolve) => {
      const next = () => {
        if (cursor >= order.length) return;
        const i = order[cursor++];
        const img = new Image();
        img.decoding = "async";
        img.src = `${base}frames/${film.prefix}d/${String(i + 1).padStart(3, "0")}.webp`;
        const done = () => {
          if (img.naturalWidth) frames[i] = img;
          loaded++;
          onProgress?.(loaded, film.frames);
          if (loaded === film.frames) resolve();
          else next();
        };
        img.onload = () => (img.decode ? img.decode().catch(() => {}).then(done) : done());
        img.onerror = done;
      };
      for (let k = 0; k < 8; k++) next();
    });
    return started;
  };

  const nearest = (i: number) => {
    if (frames[i]) return frames[i];
    for (let d = 1; d < film.frames; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  };

  return { frames, load, nearest };
}
