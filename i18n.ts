import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export const locales = routing.locales;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!routing.locales.includes(locale as any)) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`./messages/${routing.defaultLocale}.json`)).default
    };
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
