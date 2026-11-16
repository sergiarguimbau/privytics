// Every link the marketing site makes into the product or our own services,
// in one place. The signup URL used to be hardcoded in five files and pointed
// at a /register route the dashboard never had.

export const APP_URL = 'https://app.privytics.com';
export const SIGNUP_URL = `${APP_URL}/onboarding`;
export const LOGIN_URL = `${APP_URL}/login`;
export const SOURCE_URL = 'https://github.com/sergiarguimbau/privytics';

// Leave a link null until its service exists: every link to it is hidden
// while it is null, so the site never advertises a dead page.
export const DEMO_URL: string | null = null;
export const STATUS_URL: string | null = 'https://status.privytics.com';
