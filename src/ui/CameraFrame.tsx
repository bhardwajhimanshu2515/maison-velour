import { useEffect, useRef } from "react";
import type { Story } from "../film/story";
import { sample, type Film } from "../narrative/config";

// Quiet film chrome in the design's language: chapter pill + a thin scroll progress line.
export default function CameraFrame({ film, story }: { film: Film; story: Story }) {
  const bar = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const total = String(film.acts.length).padStart(2, "0");

  useEffect(() => {
    let lastIdx = -1;
    return story.on((p) => {
      const s = sample(film, p);
      if (bar.current) bar.current.style.transform = `scaleX(${s.filmProgress})`;
      // on the first film the hero copy owns the opening frame; the chapter pill appears once it has gone
      if (pill.current) pill.current.style.opacity = film.key === "making" && p < 0.05 ? "0" : "1";
      if (s.idx !== lastIdx) {
        lastIdx = s.idx;
        if (label.current) label.current.textContent = film.acts[s.idx].label;
        if (count.current) count.current.textContent = `${String(s.idx + 1).padStart(2, "0")} / ${total}`;
      }
    });
  }, [film, story, total]);

  return (
    <div className="chrome" aria-hidden="true">
      <div className="chapter" ref={pill}>
        <span className="chapter-count" ref={count}>01 / {total}</span>
        <span className="chapter-label" ref={label}>{film.acts[0].label}</span>
      </div>
      <div className="progress">
        <div ref={bar} />
      </div>
    </div>
  );
}
