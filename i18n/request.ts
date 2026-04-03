import { getRequestConfig } from 'next-intl/server';
import { routing } from '../routing';

export default getRequestConfig(async ({ locale }) => {
  // Satisfy TypeScript by guaranteeing a string
  const validLocale = locale || routing.defaultLocale || 'ar';
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
