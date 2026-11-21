import { menuById, productById, sizePrice, SIZES } from "./narrative/config";

// One line per cake + size + recipe. Menu cakes come from the collection; counter cakes from the vitrine film.
export type Line = { key: string; source: "menu" | "counter"; id: string; kg: number; eggless: boolean; qty: number };
export type Cart = Line[];

export const lineKey = (source: string, id: string, kg: number, eggless: boolean) => `${source}:${id}:${kg}:${eggless ? "e" : "n"}`;

export function lineInfo(l: Line) {
  if (l.source === "menu") {
    const c = menuById(l.id);
    const size = SIZES.find((s) => s.kg === l.kg)!;
    return { name: c.name, img: `menu/${c.id}.webp`, unit: sizePrice(c.price, l.kg), detail: `${size.label} · serves ${size.serves}${l.eggless ? " · Eggless" : ""}` };
  }
  const p = productById(l.id);
  return { name: p.name, img: `cakes/${p.id}.webp`, unit: p.price, detail: "From the counter · as shown" };
}

export const cartCount = (c: Cart) => c.reduce((a, l) => a + l.qty, 0);
export const cartTotal = (c: Cart) => c.reduce((a, l) => a + lineInfo(l).unit * l.qty, 0);
export const counterQty = (c: Cart, id: string) => c.filter((l) => l.source === "counter" && l.id === id).reduce((a, l) => a + l.qty, 0);
