export function getSiteOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function getAuthCallbackUrl() {
  return `${getSiteOrigin()}/auth/callback`;
}

export function getPasswordResetUrl() {
  return `${getSiteOrigin()}/update-password`;
}
