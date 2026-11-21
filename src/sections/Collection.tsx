import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MENU, SIZES, sizePrice, inr, type MenuCake } from "../narrative/config";
import { useCart } from "../cartContext";
import { IconHeart, IconClose, MarkEgg, MarkEggless } from "../ui/icons";

const base = import.meta.env.BASE_URL;
const KINDS = ["All", "Eggless", "Fruit", "Chocolate", "Cheesecake"] as const;
const OCCASIONS = ["Birthday", "Anniversary", "Party", "Gifting"] as const;
type Kind = (typeof KINDS)[number];

export default function Collection() {
  const [kind, setKind] = useState<Kind>("All");
  const [occasion, setOccasion] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [sizing, setSizing] = useState<MenuCake | null>(null);
  const { add } = useCart();

  // the hero's "See eggless cakes" link sets the Eggless filter
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("[data-filter]") as HTMLElement | null;
      if (a) {
        setKind(a.dataset.filter as Kind);
        setOccasion(a.dataset.occasion || null);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const cakes = useMemo(
    () =>
      MENU.filter((c) => {
        if (kind === "Eggless" && !c.eggless) return false;
        if (kind !== "All" && kind !== "Eggless" && !c.categories.includes(kind)) return false;
        if (occasion && !c.occasions.includes(occasion as never)) return false;
        return true;
      }),
    [kind, occasion]
  );

  const toggleLike = (id: string) =>
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section id="cakes" className="collection">
      <div className="wrap">
        <div className="col-head">
          <div>
            <div className="eyebrow">The collection</div>
            <h2 className="h2">
              Baked this <em>morning</em>
            </h2>
            <p className="muted">Every price includes taxes and delivery. Choose a size to see how many it serves and the earliest slot.</p>
          </div>
          <div className="filters">
            <div className="chips" role="group" aria-label="Filter by type">
              {KINDS.map((k) => (
                <button key={k} className={`chip ${kind === k ? "on" : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {k}
                </button>
              ))}
            </div>
            <div className="chips" role="group" aria-label="Filter by occasion">
              <span className="chips-label">Occasion</span>
              {OCCASIONS.map((o) => (
                <button key={o} className={`chip ${occasion === o ? "on" : ""}`} aria-pressed={occasion === o} onClick={() => setOccasion(occasion === o ? null : o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="showing" aria-live="polite">
          {kind === "All" && !occasion ? `Showing all ${cakes.length} cakes` : `Showing ${cakes.length} of ${MENU.length} cakes`}
        </p>

        {cakes.length ? (
          <div className="cards">
            {cakes.map((c, i) => {
              const wide = i === 0 && c.blurb;
              return (
                <article
                  className={`cake ${wide ? "wide" : ""}`}
                  key={c.id}
                  style={{ "--c-soft": c.theme.soft, "--c-line": c.theme.line, "--c-ink": c.theme.ink, "--c-text": c.theme.text, "--c-back": c.theme.back } as CSSProperties}
                >
                  <div className="cake-img">
                    <img src={`${base}menu/${c.id}.webp`} alt={c.name} loading="lazy" />
                    {c.badge && <span className="badge">{c.badge}</span>}
                    <button className={`heart ${liked.has(c.id) ? "on" : ""}`} aria-pressed={liked.has(c.id)} aria-label={`Save ${c.name}`} onClick={() => toggleLike(c.id)}>
                      <IconHeart filled={liked.has(c.id)} />
                    </button>
                  </div>
                  <div className="cake-body">
                    <h3>{c.name}</h3>
                    {wide && <p className="cake-blurb">{c.blurb}</p>}
                    <p className="cake-price">
                      <b>{inr(c.price)}</b> · 1 kg · serves 8–10
                    </p>
                    {c.eggless ? (
                      <p className="mark ok"><MarkEggless /> Eggless on request</p>
                    ) : (
                      <p className="mark egg"><MarkEgg /> Contains egg</p>
                    )}
                    <p className="slot">{c.slot}</p>
                    <div className="cake-actions">
                      <button className="btn btn-outline" onClick={() => setSizing(c)}>Choose size</button>
                      <button className="btn btn-dark" onClick={() => add({ source: "menu", id: c.id, kg: 1, eggless: false })} aria-label={`Add 1 kg ${c.name} to your box`}>
                        Add 1 kg
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <p>No cakes match those filters today.</p>
            <button className="btn btn-outline" onClick={() => { setKind("All"); setOccasion(null); }}>Show all cakes</button>
          </div>
        )}
      </div>
      {sizing && <SizeSheet cake={sizing} onClose={() => setSizing(null)} />}
    </section>
  );
}

function SizeSheet({ cake, onClose }: { cake: MenuCake; onClose: () => void }) {
  const { add } = useCart();
  const [kg, setKg] = useState(1);
  const [eggless, setEggless] = useState(false);
  const [qty, setQty] = useState(1);
  const panel = useRef<HTMLDivElement>(null);
  const size = SIZES.find((s) => s.kg === kg)!;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("input:checked, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, input");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [onClose]);

  return (
    <div className="sheet-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-title"
        ref={panel}
        data-lenis-prevent
        style={{ "--c-soft": cake.theme.soft, "--c-line": cake.theme.line, "--c-ink": cake.theme.ink, "--c-text": cake.theme.text } as CSSProperties}
      >
        <button className="icon-btn sheet-close" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
        <div className="sheet-head">
          <img src={`${base}menu/${cake.id}.webp`} alt="" />
          <div>
            <div className="eyebrow">Choose size</div>
            <h3 id="size-title">{cake.name}</h3>
          </div>
        </div>
        <fieldset className="sizes">
          <legend className="sr">Size</legend>
          {SIZES.map((s) => (
            <label key={s.kg} className={`size ${kg === s.kg ? "on" : ""}`}>
              <input type="radio" name="size" checked={kg === s.kg} onChange={() => setKg(s.kg)} />
              <span className="size-kg">{s.label}</span>
              <span className="size-serves">serves {s.serves}</span>
              <span className="size-price">{inr(sizePrice(cake.price, s.kg))}</span>
            </label>
          ))}
        </fieldset>
        {cake.eggless && (
          <fieldset className="recipe">
            <legend className="sr">Recipe</legend>
            <label className={`size ${!eggless ? "on" : ""}`}>
              <input type="radio" name="recipe" checked={!eggless} onChange={() => setEggless(false)} />
              <span className="size-kg">Classic</span>
              <span className="size-serves">With egg</span>
            </label>
            <label className={`size ${eggless ? "on" : ""}`}>
              <input type="radio" name="recipe" checked={eggless} onChange={() => setEggless(true)} />
              <span className="size-kg"><MarkEggless /> Eggless</span>
              <span className="size-serves">Same price</span>
            </label>
          </fieldset>
        )}
        <p className="slot">Earliest slot: {size.slot || cake.slot}</p>
        <div className="sheet-foot">
          <div className="qty" role="group" aria-label="Quantity">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">−</button>
            <span aria-live="polite">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="One more">+</button>
          </div>
          <button
            className="btn btn-dark grow"
            onClick={() => {
              add({ source: "menu", id: cake.id, kg, eggless }, qty);
              onClose();
            }}
          >
            Add {size.label} · {inr(sizePrice(cake.price, kg) * qty)}
          </button>
        </div>
      </div>
    </div>
  );
}
