import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa'
});

export type Locale = (typeof routing.locales)[number];

// Lightweight navigation APIs that are locale-aware
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
