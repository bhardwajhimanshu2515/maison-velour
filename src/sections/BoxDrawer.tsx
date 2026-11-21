import { useEffect, useRef, useState } from "react";
import { useCart } from "../cartContext";
import { lineInfo, cartCount, cartTotal } from "../cart";
import { inr } from "../narrative/config";
import { IconClose, IconArrow } from "../ui/icons";

const base = import.meta.env.BASE_URL;
const SLOTS = ["10 am – 12 pm", "12 – 2 pm", "2 – 4 pm", "4 – 6 pm", "6 – 8 pm", "8 – 10 pm"];

// "Your box": slide-over with lines, message on the cake, delivery day + 2-hour slot, contact, place order (demo).
export default function BoxDrawer() {
  const { cart, change, open, setOpen } = useCart();
  const [day, setDay] = useState<"Today" | "Tomorrow">("Today");
  const [slot, setSlot] = useState("6 – 8 pm");
  const [message, setMessage] = useState("");
  const [placed, setPlaced] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const count = cartCount(cart);
  const afterCutoff = new Date().getHours() >= 19;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(".drawer-close")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, setOpen]);

  useEffect(() => {
    if (afterCutoff && day === "Today") setDay("Tomorrow");
  }, [afterCutoff, day]);

  return (
    <div className={`drawer-wrap ${open ? "open" : ""}`} inert={!open} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="box-title" ref={panel} data-lenis-prevent>
        <header className="drawer-head">
          <h2 id="box-title">
            Your <em>box</em>
          </h2>
          <button className="icon-btn drawer-close" onClick={() => setOpen(false)} aria-label="Close your box">
            <IconClose />
          </button>
        </header>

        {placed ? (
          <div className="drawer-done" role="status">
            <h3>Thank you.</h3>
            <p>This is a demo, so no order was placed. In the live shop you would get a WhatsApp confirmation, then updates while it bakes and when it’s out for delivery.</p>
            <button className="btn btn-dark" onClick={() => { setPlaced(false); setOpen(false); }}>Back to the cakes</button>
          </div>
        ) : count === 0 ? (
          <div className="drawer-empty">
            <p>Your box is empty.</p>
            <a className="btn btn-dark" href="#cakes" onClick={() => setOpen(false)}>Browse today’s cakes</a>
          </div>
        ) : (
          <form
            className="drawer-body"
            onSubmit={(e) => {
              e.preventDefault();
              setPlaced(true);
            }}
          >
            <ul className="lines">
              {cart.map((l) => {
                const info = lineInfo(l);
                return (
                  <li key={l.key}>
                    <img src={`${base}${info.img}`} alt="" />
                    <div className="line-txt">
                      <b>{info.name}</b>
                      <span>{info.detail}</span>
                      <div className="qty sm" role="group" aria-label={`${info.name} quantity`}>
                        <button type="button" onClick={() => change(l.key, -1)} aria-label={`Remove one ${info.name}`}>−</button>
                        <span>{l.qty}</span>
                        <button type="button" onClick={() => change(l.key, 1)} aria-label={`Add one more ${info.name}`}>+</button>
                      </div>
                    </div>
                    <span className="line-price">{inr(info.unit * l.qty)}</span>
                  </li>
                );
              })}
            </ul>

            <label className="field">
              <span>Message on the cake <small>{message.length}/40</small></span>
              <input value={message} onChange={(e) => setMessage(e.target.value.slice(0, 40))} maxLength={40} placeholder="Happy birthday, Aanya" />
            </label>

            <div className="field">
              <span>Delivery day</span>
              <div className="seg" role="radiogroup" aria-label="Delivery day">
                {(["Today", "Tomorrow"] as const).map((d) => (
                  <button
                    type="button"
                    key={d}
                    role="radio"
                    aria-checked={day === d}
                    className={day === d ? "on" : ""}
                    disabled={d === "Today" && afterCutoff}
                    onClick={() => setDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {afterCutoff && <small className="hint-txt">Same-day orders close at 7 pm.</small>}
            </div>

            <label className="field">
              <span>2-hour slot</span>
              <select value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <div className="field-row">
              <label className="field">
                <span>Name</span>
                <input required autoComplete="name" />
              </label>
              <label className="field">
                <span>WhatsApp number</span>
                <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" />
              </label>
            </div>
            <label className="field">
              <span>Delivery address (Noida / Greater Noida)</span>
              <input required autoComplete="street-address" />
            </label>

            <div className="drawer-foot">
              <div className="total">
                <span>
                  {count} {count === 1 ? "cake" : "cakes"} · incl. taxes &amp; delivery
                </span>
                <b>{inr(cartTotal(cart))}</b>
              </div>
              <button className="btn btn-dark wide" type="submit">
                Place order · {day}, {slot} <IconArrow />
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
