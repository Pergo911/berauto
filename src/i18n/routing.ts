import {defineRouting} from 'next-intl/routing';

import {env} from '@/lib/env';

export const routing = defineRouting({
  locales: ['hu', 'en'],
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
