import { useEffect, useRef } from "react";
import { stories } from "../film/story";
import { sample, MAKING } from "../narrative/config";
import { IconArrow } from "./icons";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ACTS = MAKING.acts;
const story = stories.making;

// The design's hero copy over the first film, then per-act captions, then a closing call to action.
export default function BrandOverlay() {
  const hero = useRef<HTMLDivElement>(null);
  const tint = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      story.on((p) => {
        const s = sample(MAKING, p);
        const show = (el: HTMLElement | null, o: number, dy = 18) => {
          if (!el) return;
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(1 - o) * dy}px, 0)`;
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
        };
        const heroO = 1 - clamp((p - 0.012) / 0.05);
        show(hero.current, heroO, -40);
        if (tint.current) tint.current.style.opacity = String(heroO);
        if (hint.current) hint.current.style.opacity = String(1 - clamp(p / 0.02));
        caps.current.forEach((el, i) => {
          let o = 0;
          if (i === s.idx) {
            const inn = clamp((s.local - 0.12) / 0.14);
            const out = i === ACTS.length - 1 ? 1 - clamp((s.local - 0.55) / 0.15) : 1 - clamp((s.local - 0.8) / 0.12);
            o = Math.min(inn, out);
            if (i === 0) o = Math.min(o, clamp((p - 0.06) / 0.03));
          }
          show(el, o);
        });
        show(end.current, s.idx === ACTS.length - 1 ? clamp((s.filmProgress - 0.93) / 0.06) : 0, 24);
      }),
    []
  );

  return (
    <div className="overlay">
      <div className="hero-tint" ref={tint} />
      <div className="hero" ref={hero}>
        <div className="eyebrow-line">Patisserie · Sector 18, Noida</div>
        <h1 className="display">
          Artisanal
          <br />
          bakes,
          <br />
          <em>unveiled.</em>
        </h1>
        <p className="hero-lede">Fresh raspberries, whipped vanilla cream and a light sponge, baked this morning and delivered in the slot you pick.</p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#cakes">
            Order for today <IconArrow />
          </a>
          <a className="link-u" href="#cakes" data-filter="Eggless">
            See eggless cakes
          </a>
        </div>
        <p className="hero-note">Same-day orders until 7 pm · Delivery across Noida and Greater Noida</p>
      </div>

      {ACTS.map((a, i) => (
        <div className={`cap cap-${i % 2 ? "r" : "l"}`} key={a.id} ref={(el) => void (caps.current[i] = el)}>
          <div className="cap-no">
            {String(i + 1).padStart(2, "0")} — {a.label}
          </div>
          <h2>{a.title}</h2>
          <p>{a.line}</p>
        </div>
      ))}

      <div className="end" ref={end}>
        <div className="eyebrow-line light center">Baked this morning</div>
        <h2 className="display sm">
          Fresh from <em>the oven.</em>
        </h2>
        <p>Every cake is finished by hand a few hours before it reaches you.</p>
        <div className="end-cta">
          <a className="btn btn-primary" href="#cakes">
            See today’s cakes <IconArrow />
          </a>
          <a className="btn btn-ghost" href="#counter">Walk the counter</a>
        </div>
      </div>

      <div className="hint" ref={hint}>
        <span>Scroll to unveil</span>
        <i />
      </div>
    </div>
  );
}
