import { useEffect, useRef } from "react";
import { stories } from "../film/story";
import { sample, VITRINE, productById, inr } from "../narrative/config";
import { useCart } from "../cartContext";
import { counterQty } from "../cart";
import { IconArrow } from "./icons";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ACTS = VITRINE.acts;
const story = stories.vitrine;
const base = import.meta.env.BASE_URL;

// HTML layer over the display-case film: intro, per-shelf caption + product rail, closing CTA.
export default function VitrineOverlay() {
  const { cart, add, setOpen } = useCart();
  const intro = useRef<HTMLDivElement>(null);
  const groups = useRef<(HTMLDivElement | null)[]>([]);
  const end = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      story.on((p) => {
        const s = sample(VITRINE, p);
        const show = (el: HTMLElement | null, o: number, dy = 18) => {
          if (!el) return;
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(1 - o) * dy}px, 0)`;
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
        };
        show(intro.current, s.idx === 0 ? 1 - clamp((s.local - 0.55) / 0.25) : 0, -30);
        groups.current.forEach((el, i) => {
          let o = 0;
          if (i === s.idx) o = Math.min(clamp((s.local - 0.08) / 0.15), 1 - clamp((s.local - 0.86) / 0.12));
          show(el, o);
        });
        show(end.current, s.idx === ACTS.length - 1 ? clamp((s.local - 0.35) / 0.3) : 0, 24);
      }),
    []
  );

  return (
    <div className="overlay">
      <div className="v-intro" ref={intro}>
        <div className="eyebrow-line light center">The counter · Ten cakes · Baked today</div>
        <h2 className="display sm">
          Today’s <em>counter</em>
        </h2>
        <p className="hero-lede center">Walk along the glass. Anything you pass can go straight into your box.</p>
      </div>

      {ACTS.map((a, i) =>
        a.products ? (
          <div className="v-group" key={a.id} ref={(el) => void (groups.current[i] = el)}>
            <div className="cap cap-l v-cap">
              <div className="cap-no">
                {String(i + 1).padStart(2, "0")} — {a.label}
              </div>
              <h2>{a.title}</h2>
              <p>{a.line}</p>
            </div>
            <ul className="rail" aria-label={`${a.title}: cakes in view`}>
              {a.products.map((id) => {
                const p = productById(id);
                const q = counterQty(cart, id);
                return (
                  <li className="rail-card" key={id}>
                    <img src={`${base}cakes/${id}.webp`} alt="" />
                    <div className="rail-txt">
                      <b>{p.name}</b>
                      <span>{inr(p.price)} · as shown</span>
                    </div>
                    <button
                      className={`add ${q ? "on" : ""}`}
                      onClick={() => add({ source: "counter", id, kg: 0, eggless: false })}
                      aria-label={`Add ${p.name} to your box${q ? `, ${q} in box` : ""}`}
                    >
                      {q ? `In box · ${q}` : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null
      )}

      <div className="end" ref={end}>
        <div className="eyebrow-line light center">Ten cakes · From {inr(699)}</div>
        <h2 className="display sm">
          Choose <em>yours.</em>
        </h2>
        <p>Every price includes taxes and delivery.</p>
        <div className="end-cta">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            Open your box <IconArrow />
          </button>
          <a className="btn btn-ghost" href="#cakes">See the full menu</a>
        </div>
      </div>
    </div>
  );
}
