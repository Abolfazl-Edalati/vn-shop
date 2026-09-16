'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { skins, USD_TO_TOMAN, type MockSkin } from '@/data/skins';

export type CartLine = { id: string; qty: number };

type CartContextValue = {
  /** ready=false until localStorage has been read (avoids hydration mismatch) */
  ready: boolean;
  lines: CartLine[];
  items: { skin: MockSkin; qty: number }[];
  count: number;
  totalUsd: number;
  totalToman: number;
  has: (id: string) => boolean;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'vn-cart';

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l) => l && typeof l.id === 'string' && Number(l.qty) > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // `null` means "not hydrated yet". This is what makes the persist effect below
  // safe: it can never write the pre-hydration empty array over saved data.
  const [lines, setLines] = useState<CartLine[] | null>(null);

  useEffect(() => {
    setLines(readStorage());
  }, []);

  useEffect(() => {
    if (lines === null) return; // still hydrating — never persist the empty initial state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const base = prev ?? [];
      const found = base.find((l) => l.id === id);
      if (!found) return [...base, { id, qty }];
      return base.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => (prev ?? []).filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => {
      const base = prev ?? [];
      return qty <= 0
        ? base.filter((l) => l.id !== id)
        : base.map((l) => (l.id === id ? { ...l, qty } : l));
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const safeLines = lines ?? [];
    const items = safeLines
      .map((l) => {
        const skin = skins.find((s) => s.id === l.id);
        return skin ? { skin, qty: l.qty } : null;
      })
      .filter((x): x is { skin: MockSkin; qty: number } => x !== null);

    const totalUsd = items.reduce((sum, i) => sum + i.skin.price_usd * i.qty, 0);
    return {
      ready: lines !== null,
      lines: safeLines,
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      totalUsd,
      totalToman: Math.round(totalUsd * USD_TO_TOMAN),
      has: (id: string) => safeLines.some((l) => l.id === id),
      add,
      remove,
      setQty,
      clear,
    };
  }, [lines, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}