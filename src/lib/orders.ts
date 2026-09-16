'use client';

// Mock order store — persists to localStorage (phase 1: no backend yet).
export type PaymentMethod = 'card' | 'crypto' | 'wallet';

export type OrderLine = {
  id: string;
  name: string;
  image: string;
  rarity_color: string;
  wear: string;
  float: number;
  qty: number;
  price_usd: number;
};

export type Order = {
  id: string;
  created_at: number;
  lines: OrderLine[];
  total_usd: number;
  total_toman: number;
  payment: PaymentMethod;
  trade_url: string;
  email: string;
  /** escrow timeline step, 0..3 */
  step: number;
};

const KEY = 'vn-orders';
const SELL_KEY = 'vn-sell-orders';

function readAll(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  try {
    const all = readAll().filter((o) => o.id !== order.id);
    localStorage.setItem(KEY, JSON.stringify([order, ...all].slice(0, 30)));
  } catch {}
}

export function getOrder(id: string): Order | undefined {
  return readAll().find((o) => o.id === id);
}

export function updateOrderStep(id: string, step: number): Order | undefined {
  const all = readAll();
  const found = all.find((o) => o.id === id);
  if (!found) return undefined;
  found.step = Math.max(0, Math.min(3, step));
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
  return found;
}

export function newOrderId(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `VN-${n}`;
}

/* ------------------------------------------------------------------ *
 * Sell orders — a user selling their items TO VN Shop (instant sell).
 * ------------------------------------------------------------------ */

export type SellOrder = {
  id: string;
  created_at: number;
  lines: OrderLine[];
  /** market value of the items being sold */
  total_usd: number;
  total_toman: number;
  /** what the user actually receives, after the VN Shop fee */
  payout_usd: number;
  payout_method: string;
  payout_target: string;
  /** payout rate applied, 0..1 */
  rate: number;
  /** escrow/handshake step, 0..3 */
  step: number;
};

export function saveSellOrder(order: SellOrder): void {
  try {
    const raw = localStorage.getItem(SELL_KEY);
    const all = raw ? (JSON.parse(raw) as SellOrder[]) : [];
    const next = [order, ...(Array.isArray(all) ? all : [])].slice(0, 30);
    localStorage.setItem(SELL_KEY, JSON.stringify(next));
  } catch {}
}

export function getSellOrder(id: string): SellOrder | undefined {
  try {
    const raw = localStorage.getItem(SELL_KEY);
    const all = raw ? (JSON.parse(raw) as SellOrder[]) : [];
    return all.find((o) => o.id === id);
  } catch {
    return undefined;
  }
}
