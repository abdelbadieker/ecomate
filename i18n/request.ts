import { getRequestConfig } from 'next-intl/server';
import { routing } from '../routing';

export default getRequestConfig(async ({ locale }) => {
  // Direct binding to the locale param and strictly formatted dynamic import
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
