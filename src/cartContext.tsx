import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { lineKey, type Cart, type Line } from "./cart";

type Ctx = {
  cart: Cart;
  add: (l: Omit<Line, "key" | "qty">, qty?: number) => void;
  change: (key: string, delta: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  toast: string;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const add = useCallback((l: Omit<Line, "key" | "qty">, qty = 1) => {
    const key = lineKey(l.source, l.id, l.kg, l.eggless);
    setCart((c) => {
      const i = c.findIndex((x) => x.key === key);
      if (i >= 0) return c.map((x, j) => (j === i ? { ...x, qty: x.qty + qty } : x));
      return [...c, { ...l, key, qty }];
    });
    setToast(`Added to your box · ${Date.now()}`);
  }, []);

  const change = useCallback((key: string, delta: number) => {
    setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + delta } : x)).filter((x) => x.qty > 0));
  }, []);

  const value = useMemo(() => ({ cart, add, change, open, setOpen, toast }), [cart, add, change, open, toast]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
