import { OpenPanel } from '@openpanel/web';
import { readAttribution, toFirstTouchProperties } from '@/utils/attribution';
import { shouldSendAnalyticsEvent } from '@/utils/op-filter';

const clientId = import.meta.env.VITE_OP_CLIENT_ID;

export const op = new OpenPanel({
  clientId,
  disabled: clientId === 'undefined' || !clientId,
  // Privytics: the SDK's default host is OpenPanel's; dashboard users' data
  // must never leave our ingestion.
  apiUrl: 'https://api.privytics.com',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
  filter: shouldSendAnalyticsEvent,
  // sessionReplay: {
  //   enabled: true,
  // }
});

// Every funnel event carries the marketing first touch, so sign-ups and
// activations can be broken down by the channel that brought them.
op.setGlobalProperties(toFirstTouchProperties(readAttribution()));
