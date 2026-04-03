import { getRequestConfig } from 'next-intl/server';
import { routing } from '../routing';

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = locale || 'ar';
  
  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});
