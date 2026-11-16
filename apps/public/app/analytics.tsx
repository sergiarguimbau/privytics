'use client';

import { OpenPanelComponent } from '@openpanel/nextjs';

/**
 * Privytics tracking its own marketing site, installed the same way a customer
 * would: the published `@openpanel/nextjs` package from npm. This page is
 * public, so it doubles as a working demonstration of the integration we
 * document. If it breaks here, it is broken for customers too.
 *
 * Configured through the environment rather than hardcoded, so the repository
 * carries no client id and local development sends nothing. Set
 * NEXT_PUBLIC_PRIVYTICS_CLIENT_ID at build time to switch it on; when it is
 * absent this renders nothing at all.
 *
 * `apiUrl` is required: the npm package is OpenPanel's and defaults to
 * api.openpanel.dev, so without it our own analytics would land in their
 * service rather than ours.
 *
 * `scriptUrl` is a deliberate choice, not a requirement. The component defaults
 * to openpanel.dev/op1.js and works that way, which is what OpenPanel's own
 * self-hosting guide does. We override it because we already serve /op1.js for
 * the script-tag install, and because openpanel.dev is not on the sub-processor
 * list our Privacy Policy publishes, so we would rather visitors' browsers not
 * call it. Dropping this line would not break tracking.
 *
 * Cookieless: this writes nothing to the visitor's device, which is what lets
 * the Privacy Policy say our own analytics need no consent banner. If that ever
 * changes, that page has to change with it.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_PRIVYTICS_CLIENT_ID;
const API_URL =
  process.env.NEXT_PUBLIC_PRIVYTICS_API_URL || 'https://api.privytics.com';

export function Analytics() {
  if (!CLIENT_ID) {
    return null;
  }

  return (
    <OpenPanelComponent
      apiUrl={API_URL}
      clientId={CLIENT_ID}
      scriptUrl="/op1.js"
      trackAttributes
      trackOutgoingLinks
      trackScreenViews
    />
  );
}
