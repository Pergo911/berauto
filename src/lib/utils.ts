import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

import {hasLocale} from 'next-intl';

import {routing} from '@/i18n/routing';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toIntlLocale(locale: string): string {
  const normalized = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return normalized === 'en' ? 'en-US' : 'hu-HU';
}

export function formatDate(date: Date | string, locale = 'hu'): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale = 'hu'): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, locale = 'hu'): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount);
}
