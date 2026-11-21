// All narrative data for the two films lives here, separate from components.

export type Act = {
  id: string;
  label: string; // boxed act label
  title: string; // big caption
  line: string; // small caption
  from: number; // video seconds
  to: number;
  focusX: number; // subject centre (0–1) for portrait crops
  products?: string[]; // vitrine: cakes in shot
};

export type Film = {
  key: "making" | "vitrine";
  prefix: string; // frame chunk prefix in public/frames
  frames: number;
  fps: number;
  scrollLength: number; // viewport heights of pinned scroll
  playShare: number; // share of the pin that plays the film; the rest holds the last frame
  lens: string;
  push: number; // slow push-in per act
  bloomCuts: boolean; // exposure bloom across act boundaries (only where the film really cuts)
  warmth: [number, number]; // grade key at start and end (negative = cooler, pulls back a yellow cast)
  acts: Act[];
};

// Film 1 — the making of the signature cake. Cut points from scene detection.
export const MAKING: Film = {
  key: "making",
  prefix: "",
  frames: 240,
  fps: 24,
  scrollLength: 9,
  playShare: 0.92,
  lens: "50mm · f/1.8 · 24fps",
  push: 0.06,
  bloomCuts: true,
  warmth: [0.3, 0.8],
  acts: [
    { id: "sift", label: "Sift", title: "First, the flour", line: "Stone-milled, sifted twice, by hand.", from: 0, to: 0.96, focusX: 0.3 },
    { id: "crack", label: "Crack", title: "Farm eggs", line: "Golden yolks from a single farm, cracked to order.", from: 0.96, to: 2, focusX: 0.5 },
    { id: "whisk", label: "Whisk", title: "Dark chocolate", line: "70% single-origin cacao, folded slow.", from: 2, to: 2.96, focusX: 0.55 },
    { id: "bake", label: "Bake", title: "Into the oven", line: "Low heat. No shortcuts. Ever.", from: 2.96, to: 4, focusX: 0.5 },
    { id: "layer", label: "Layer", title: "Vanilla crème", line: "Whipped Madagascar vanilla, spread by palette knife.", from: 4, to: 5, focusX: 0.42 },
    { id: "glaze", label: "Glaze", title: "The mirror pour", line: "Warm ganache, poured once, never touched again.", from: 5, to: 6, focusX: 0.48 },
    { id: "crown", label: "Crown", title: "Berries & gold", line: "Morning strawberries, 24k leaf, chocolate curls.", from: 6, to: 7, focusX: 0.5 },
    { id: "reveal", label: "Reveal", title: "Unveiled", line: "Lid off, slot picked, on its way to you.", from: 7, to: 10, focusX: 0.5 },
  ],
};

// Film 2 — one continuous dolly along the display case. Acts follow what is in shot.
export const VITRINE: Film = {
  key: "vitrine",
  prefix: "v",
  frames: 240,
  fps: 24,
  scrollLength: 7,
  playShare: 0.94,
  lens: "35mm · f/2 · 24fps",
  push: 0, // the camera in the film already moves; no extra push
  bloomCuts: false,
  warmth: [-0.7, -0.3], // the case is lit very yellow: cool it toward ivory, warm back a little
  acts: [
    { id: "case", label: "Counter", title: "Today's counter", line: "Ten cakes, baked this morning. Walk along the glass.", from: 0, to: 2.4, focusX: 0.5 },
    { id: "left", label: "Shelf I", title: "Chocolate & classics", line: "Belgian truffle, red velvet, Biscoff and tiramisu.", from: 2.4, to: 4.6, focusX: 0.32, products: ["truffle", "redvelvet", "biscoff", "tiramisu"] },
    { id: "centre", label: "Shelf II", title: "Fruit & cream", line: "Fresh strawberries and Alphonso mango.", from: 4.6, to: 5.8, focusX: 0.6, products: ["strawberry", "mango"] },
    { id: "right", label: "Shelf III", title: "Nuts, berries & cherries", line: "Cheesecake, black forest, pistachio and praline.", from: 5.8, to: 7.4, focusX: 0.62, products: ["cheesecake", "blackforest", "pistachio", "caramel"] },
    { id: "choose", label: "Choose", title: "", line: "", from: 7.4, to: 10, focusX: 0.5 },
  ],
};

export type Product = { id: string; name: string; price: number; note: string };

// Names and prices as written on the cards in the display case film
export const PRODUCTS: Product[] = [
  { id: "truffle", name: "Belgian Chocolate Truffle", price: 899, note: "Dark ganache, cocoa sponge, hand-rolled truffles." },
  { id: "redvelvet", name: "Classic Red Velvet", price: 799, note: "Buttermilk velvet, cream-cheese frosting, crumb coat." },
  { id: "strawberry", name: "Fresh Strawberry Cream", price: 749, note: "Chantilly, vanilla sponge, halved morning berries." },
  { id: "cheesecake", name: "Blueberry Cheesecake", price: 799, note: "Baked New York style, blueberry compote, fresh berries." },
  { id: "blackforest", name: "Royal Black Forest", price: 699, note: "Kirsch cherries, chocolate shavings, whipped cream." },
  { id: "biscoff", name: "Lotus Biscoff Cake", price: 999, note: "Speculoos sponge, Biscoff drip and biscuits." },
  { id: "tiramisu", name: "Italian Tiramisu", price: 899, note: "Espresso-soaked savoiardi, mascarpone, cocoa." },
  { id: "mango", name: "Mango Delight", price: 749, note: "Alphonso mango glaze, vanilla chiffon, fresh cubes." },
  { id: "pistachio", name: "Pistachio Rose", price: 1099, note: "Pistachio sponge, rose cream, slivered nuts and petals." },
  { id: "caramel", name: "Salted Caramel Praline", price: 949, note: "Caramel drip, hazelnut praline shards, gold leaf." },
];
export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Map scroll progress (0–1 of the pinned section) to a fractional frame + act info.
export function sample(film: Film, progress: number) {
  const f = Math.min(1, Math.max(0, progress / film.playShare));
  const n = film.acts.length;
  const pos = f * n;
  const idx = Math.min(n - 1, Math.floor(pos));
  const local = idx === n - 1 && f >= 1 ? 1 : pos - idx;
  const act = film.acts[idx];
  const seconds = act.from + (act.to - act.from) * local;
  const frame = Math.min(film.frames - 1, seconds * film.fps);
  return { frame, idx, local, act, seconds, filmProgress: f };
}

export const BRAND = {
  name: "Maison Doré",
  script: "Maison",
  est: "Est. 1987",
};

// ---------- Menu from the design ("Baked this morning") ----------
export type Category = "Fruit" | "Chocolate" | "Cheesecake";
export type Occasion = "Birthday" | "Anniversary" | "Party" | "Gifting";
export type MenuCake = {
  id: string;
  name: string;
  blurb?: string;
  price: number; // 1 kg, incl. taxes and delivery
  eggless: boolean; // eggless on request
  slot: string; // earliest slot
  badge?: string;
  categories: Category[];
  occasions: Occasion[];
  theme: { soft: string; line: string; ink: string; text: string; back: string }; // card colours taken from the cake
};

export const MENU: MenuCake[] = [
  { id: "raspberry", name: "Raspberry cream", blurb: "Light vanilla sponge, raspberry glaze and whipped cream, crowned with sugar-dusted raspberries.", price: 1350, eggless: true, slot: "Ready today, 6–8 pm", badge: "Signature", categories: ["Fruit"], occasions: ["Birthday", "Anniversary", "Gifting"], theme: { soft: "#fbeef0", line: "#f1d3d8", ink: "#8e2a43", text: "#4a1020", back: "#c06f78" } },
  { id: "blueberry", name: "Blueberry lavender cheesecake", price: 1450, eggless: false, slot: "From tomorrow, 10 am–12 pm", badge: "New", categories: ["Fruit", "Cheesecake"], occasions: ["Anniversary", "Gifting"], theme: { soft: "#f3effa", line: "#ddd3ee", ink: "#5b4396", text: "#2f2350", back: "#a497cc" } },
  { id: "mango", name: "Mango cheesecake", price: 1400, eggless: false, slot: "From tomorrow, 10 am–12 pm", categories: ["Fruit", "Cheesecake"], occasions: ["Party", "Birthday"], theme: { soft: "#fdf5e1", line: "#f2dca4", ink: "#975207", text: "#4a2c05", back: "#eebe56" } },
  { id: "pineapple", name: "Pineapple coconut", price: 1250, eggless: true, slot: "Ready today, 8–10 pm", categories: ["Fruit"], occasions: ["Party", "Birthday"], theme: { soft: "#fbf6df", line: "#ebdfa3", ink: "#6f5f0e", text: "#3e3505", back: "#e4cd82" } },
  { id: "blackforest", name: "Black forest", price: 1150, eggless: true, slot: "Ready today, 6–8 pm", badge: "Classic", categories: ["Chocolate", "Fruit"], occasions: ["Birthday", "Party"], theme: { soft: "#f6eee9", line: "#e4d3c7", ink: "#4e2c1d", text: "#2e1a10", back: "#875f46" } },
  { id: "redvelvet", name: "Red velvet", price: 1250, eggless: true, slot: "Ready today, 6–8 pm", categories: [], occasions: ["Anniversary", "Birthday", "Gifting"], theme: { soft: "#fbeced", line: "#f0cfd1", ink: "#8f1d2c", text: "#4a0d16", back: "#b2464e" } },
  { id: "strawberry", name: "Strawberry fraisier", price: 1500, eggless: false, slot: "Ready today, 8–10 pm", badge: "Chef’s pick", categories: ["Fruit"], occasions: ["Anniversary", "Gifting"], theme: { soft: "#fdeef0", line: "#f5d0d5", ink: "#b3304a", text: "#4f1220", back: "#e2707a" } },
  { id: "hazelnut", name: "Chocolate hazelnut", price: 1350, eggless: true, slot: "Ready today, 6–8 pm", categories: ["Chocolate"], occasions: ["Birthday", "Party", "Gifting"], theme: { soft: "#f8f0e8", line: "#e8d6c3", ink: "#7a4b26", text: "#3b2412", back: "#ac8259" } },
];
export const menuById = (id: string) => MENU.find((c) => c.id === id)!;

// Sizes: price scales from the 1 kg price; larger cakes need more lead time
export const SIZES = [
  { kg: 0.5, label: "½ kg", serves: "4–5", factor: 0.55, slot: null as string | null },
  { kg: 1, label: "1 kg", serves: "8–10", factor: 1, slot: null as string | null },
  { kg: 1.5, label: "1½ kg", serves: "12–15", factor: 1.45, slot: "From tomorrow, 10 am–12 pm" },
  { kg: 2, label: "2 kg", serves: "16–20", factor: 1.9, slot: "From tomorrow, 10 am–12 pm" },
];
export const sizePrice = (price: number, kg: number) => {
  const s = SIZES.find((x) => x.kg === kg)!;
  return Math.round((price * s.factor) / 10) * 10;
};
