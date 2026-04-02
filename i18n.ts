import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export const locales = routing.locales;

export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale string for the return type
  const activeLocale = locale || routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`./messages/${activeLocale}.json`)).default
  };
});
