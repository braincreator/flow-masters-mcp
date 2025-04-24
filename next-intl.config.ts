import { Pathnames } from 'next-intl/navigation';

export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export const pathnames = {
  '/': '/',
  '/chat': '/chat',
  '/login': '/login',
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/courses': '/courses',
  '/courses/[slug]': '/courses/[slug]',
} satisfies Pathnames<typeof locales>;

export const localePrefix = 'as-needed';

export type PathnameLocale = typeof locales[number];
