import 'next-intl';

export type MockSkin = {
  id: string;
  market_hash_name: string;
  weapon: string;
  pattern: string;
  name: string;
  category: 'Rifles' | 'Pistols' | 'Knives' | 'Gloves';
  rarity_color: string;
  rarity_name?: string;
  stattrak: boolean;
  wear: string;
  float: number;
  min_float?: number;
  max_float?: number;
  paint_index?: number;
  price_usd: number;
  steam_price_usd: number;
  discount_pct: number;
  image: string;
  case: string;
  seller: string;
  seller_trades: number;
  pattern_index: number;
  souvenir: boolean;
  listed_hours_ago: number;
};

import raw from './skins.json';

export const skins: MockSkin[] = raw as unknown as MockSkin[];

// USD → Toman conversion rate for mock data (approximate free-market rate)
export const USD_TO_TOMAN = 105000;

export function formatToman(usd: number, locale: string): string {
  const toman = Math.round(usd * USD_TO_TOMAN);
  if (locale === 'fa') {
    return new Intl.NumberFormat('fa-IR').format(toman);
  }
  return new Intl.NumberFormat('en-US').format(toman);
}

export function formatUsd(usd: number, locale: string): string {
  if (locale === 'fa') {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(usd);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usd);
}

export function formatFaNum(n: number, locale: string): string {
  return locale === 'fa'
    ? new Intl.NumberFormat('fa-IR').format(n)
    : new Intl.NumberFormat('en-US').format(n);
}

// --- Locale-aware price helpers ---
// fa: primary = Toman (Persian digits), secondary = USD
// en: primary = USD, secondary = Toman (Latin digits, "Toman" in English)
export function tomanString(usd: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(
    Math.round(usd * USD_TO_TOMAN)
  );
}

export function usdString(usd: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usd);
}

export function primaryPrice(usd: number, locale: string): string {
  return locale === 'fa' ? tomanString(usd, 'fa') : usdString(usd, 'en');
}

export function secondaryPrice(usd: number, locale: string): string {
  return locale === 'fa'
    ? usdString(usd, 'fa')
    : `${tomanString(usd, 'en')} Toman`;
}

// Section helpers
export function getTrending(): MockSkin[] {
  return [...skins].sort((a, b) => b.seller_trades - a.seller_trades).slice(0, 8);
}

export function getUnder100(): MockSkin[] {
  return skins.filter((s) => s.price_usd < 100).slice(0, 8);
}

export function getBestDeals(): MockSkin[] {
  return [...skins]
    .sort((a, b) => b.discount_pct - a.discount_pct)
    .slice(0, 8);
}

export function getKnivesGloves(): MockSkin[] {
  return skins
    .filter((s) => s.category === 'Knives' || s.category === 'Gloves')
    .sort((a, b) => b.price_usd - a.price_usd)
    .slice(0, 8);
}

export function getJustListed(): MockSkin[] {
  return [...skins].sort((a, b) => a.listed_hours_ago - b.listed_hours_ago).slice(0, 8);
}

export function getRareSpecials(): MockSkin[] {
  // top-value knives + gloves for the "rare specials" section
  return [...skins]
    .filter((s) => s.category === 'Knives' || s.category === 'Gloves')
    .sort((a, b) => b.price_usd - a.price_usd)
    .slice(0, 3);
}

export function getDemoInventory(): MockSkin[] {
  return [...skins]
    .sort((a, b) => b.price_usd - a.price_usd)
    .slice(0, 6);
}

export function getSkinById(id: string): MockSkin | undefined {
  return skins.find((s) => s.id === id);
}

export function getSkinBySlug(slug: string): MockSkin | undefined {
  return skins.find((s) => s.id === slug);
}

export const TOTAL_LISTINGS = 41928;
