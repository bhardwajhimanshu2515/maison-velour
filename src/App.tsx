import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import FilmStage from "./film/FilmStage";
import { createFrameStore } from "./film/frames";
import { stories } from "./film/story";
import { MAKING, VITRINE, type Film } from "./narrative/config";
import BrandOverlay from "./ui/BrandOverlay";
import VitrineOverlay from "./ui/VitrineOverlay";
import Collection from "./sections/Collection";
import BoxDrawer from "./sections/BoxDrawer";
import { TrustStrip, Bridge, Kitchen, Footer } from "./sections/Page";
import { CartProvider, useCart } from "./cartContext";
import { cartCount } from "./cart";

gsap.registerPlugin(ScrollTrigger);

const makingStore = createFrameStore(MAKING);
const vitrineStore = createFrameStore(VITRINE);

function Nav() {
  const { cart, setOpen, toast } = useCart();
  const count = cartCount(cart);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 1600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <header className="nav">
      <div className="nav-bar">
        <a href="#top" className="logo">
          Maison <em>Velour</em>
        </a>
        <nav aria-label="Main">
          <a href="#cakes">Cakes</a>
          <a href="#kitchen">Our kitchen</a>
          <a href="#visit">Visit &amp; contact</a>
        </nav>
        <button className={`box-pill ${bump ? "bump" : ""}`} onClick={() => setOpen(true)} aria-label={`Your box, ${count} ${count === 1 ? "item" : "items"}`}>
          Your box <span className="box-count">{count}</span>
        </button>
      </div>
      <div className={`toast ${bump ? "show" : ""}`} role="status" aria-live="polite">
        {bump ? "Added to your box" : ""}
      </div>
    </header>
  );
}

function Site() {
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const making = useRef<HTMLElement>(null);
  const vitrine = useRef<HTMLElement>(null);
  const { open } = useCart();
  const lenisRef = useRef<Lenis | null>(null);

  // film 1 opens the site once its key frames have decoded; film 2 loads right after film 1
  useEffect(() => {
    let opened = false;
    makingStore
      .load((n, total) => {
        setPct(Math.round((n / total) * 100));
        if (!opened && n >= 40) {
          opened = true;
          setTimeout(() => setReady(true), 300);
        }
      })
      .then(() => vitrineStore.load());
  }, []);

  // Lenis + one GSAP master timeline per film, pinned and scrubbed; each only writes its story.progress
  useLayoutEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const pinFilm = (el: HTMLElement | null, film: Film) => {
      const story = stories[film.key];
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * film.scrollLength}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });
      tl.to(story, { progress: 1, ease: "none", duration: 1 });
      film.acts.forEach((a, i) => tl.addLabel(a.id, (i / film.acts.length) * film.playShare));
    };
    const ctx = gsap.context(() => {
      pinFilm(making.current, MAKING);
      pinFilm(vitrine.current, VITRINE);
    });
    // filters, lazy images and fonts change the page height: re-measure the pins so the counter film stays in step
    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    document.querySelectorAll(".page").forEach((el) => ro.observe(el));

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      e.preventDefault();
      if (id === "#top") return lenis.scrollTo(0);
      const el = document.querySelector(id);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: id === "#counter" ? 0 : -84 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      ro.disconnect();
      gsap.ticker.remove(raf);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  // page scroll pauses while the box or a dialog is open
  useEffect(() => {
    if (open) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("locked", !ready);
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    <>
      <div className={`loader ${ready ? "done" : ""}`}>
        <div className="loader-in">
          <div className="logo light big">
            Maison <em>Velour</em>
          </div>
          <div className="bar">
            <i style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <small>Lifting the lid · {pct}%</small>
        </div>
      </div>

      <Nav />

      <main id="top">
        <FilmStage ref={making} film={MAKING} story={stories.making} store={makingStore} className="film-making">
          <BrandOverlay />
        </FilmStage>
        <div className="page">
          <TrustStrip />
          <Collection />
          <Bridge />
        </div>
        <FilmStage ref={vitrine} id="counter" film={VITRINE} story={stories.vitrine} store={vitrineStore} className="film-vitrine">
          <VitrineOverlay />
        </FilmStage>
        <div className="page">
          <Kitchen />
          <Footer />
        </div>
      </main>
      <BoxDrawer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Site />
    </CartProvider>
  );
}
