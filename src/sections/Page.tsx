import { useState } from "react";
import { IconCake, IconClock, IconChat, IconBox, IconGlass, IconPencil, MarkEggless } from "../ui/icons";

const base = import.meta.env.BASE_URL;

export function TrustStrip() {
  const items = [
    { icon: <IconCake />, t: "Baked every morning", d: "Small batches, finished by hand." },
    { icon: <IconClock />, t: "Your delivery slot", d: "Choose a 2-hour window that suits you." },
    { icon: <IconChat />, t: "Updates on WhatsApp", d: "Order received, baking, then out for delivery." },
    { icon: <IconBox />, t: "Packed to travel", d: "Boxed and boarded so it reaches you intact." },
  ];
  return (
    <section className="strip" aria-label="How we bake and deliver">
      <ul className="wrap strip-in">
        {items.map((i) => (
          <li key={i.t}>
            <span className="strip-ic">{i.icon}</span>
            <div>
              <b>{i.t}</b>
              <span>{i.d}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Bridge() {
  return (
    <section className="bridge">
      <div className="eyebrow">Next · The counter</div>
      <p>
        Prefer to browse the glass? <em>Walk our counter</em> and add anything you pass.
      </p>
      <i />
    </section>
  );
}

export function Kitchen() {
  return (
    <section id="kitchen" className="kitchen">
      <div className="wrap kitchen-in">
        <img src={`${base}menu/kitchen.webp`} alt="Black forest cake topped with cherries, cream and chocolate shards" loading="lazy" />
        <div>
          <div className="eyebrow">From our kitchen</div>
          <h2 className="h2">
            Made by hand, <em>the same morning</em> it reaches you.
          </h2>
          <p className="muted">We bake in small batches through the day, so the cake in your box was finished a few hours before it left our kitchen.</p>
          <ul className="points">
            <li><span className="pt-ic"><IconGlass /></span><p><b>Real butter, cream and fruit.</b> No premixes in the sponge or the frosting.</p></li>
            <li><span className="pt-ic"><MarkEggless /></span><p><b>Eggless on request.</b> Choose “Eggless” when you pick a size; the recipe changes, not the price.</p></li>
            <li><span className="pt-ic"><IconPencil /></span><p><b>A message on top.</b> Add up to 40 characters in your box and we pipe it on.</p></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [joined, setJoined] = useState(false);
  return (
    <footer id="visit" className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="logo light">Maison <em>Velour</em></div>
            <p>Shop 12, Sector 18 market, Noida</p>
            <p>Open daily, 10 am – 10 pm</p>
          </div>
          <div>
            <div className="foot-h">Shop</div>
            <a href="#cakes" data-filter="All">All cakes</a>
            <a href="#cakes" data-filter="Eggless">Eggless cakes</a>
            <a href="#cakes" data-filter="All" data-occasion="Birthday">Birthday cakes</a>
          </div>
          <div>
            <div className="foot-h">Help</div>
            <p>WhatsApp us: +91 98000 00000</p>
            <p>Call the shop: +91 98000 00000</p>
            <p className="dim">Same-day orders until 7 pm</p>
            <p className="dim">Delivery across Noida and Greater Noida</p>
          </div>
          <div>
            <div className="foot-h">New cakes each month</div>
            {joined ? (
              <p role="status">You’re on the list. (Demo — nothing was sent.)</p>
            ) : (
              <form className="join" onSubmit={(e) => { e.preventDefault(); setJoined(true); }}>
                <label className="sr" htmlFor="join-email">Email address</label>
                <input id="join-email" type="email" required placeholder="you@example.com" autoComplete="email" />
                <button className="btn btn-pill" type="submit">Join</button>
              </form>
            )}
          </div>
        </div>
        <div className="foot-base">
          <div>
            <p>FSSAI licence: [YOUR FSSAI NUMBER]</p>
            <p>Sample menu, prices, contact details and photos for this demo. Replace before launch.</p>
          </div>
          <nav aria-label="Policies">
            <a href="#visit">Refund &amp; cancellation policy</a>
            <a href="#visit">Privacy</a>
            <a href="#visit">Terms</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
