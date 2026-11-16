import { Link, Text } from '@react-email/components';
import { z } from 'zod';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { withUtm } from '../utm';

export const zOnboardingWelcome = z.object({
  firstName: z.string().optional(),
  dashboardUrl: z.string(),
  hasData: z.boolean().default(false),
});

export type Props = z.infer<typeof zOnboardingWelcome>;
export default OnboardingWelcome;
export function OnboardingWelcome({
  firstName,
  dashboardUrl = 'https://app.privytics.com',
  hasData = false,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
      <Text>Thanks for signing up to Privytics, we're glad you're here.</Text>
      <Text>
        Your free plan includes 10,000 events a month, for as long as you like.
        No card, no expiry. Upgrade whenever you outgrow it.
      </Text>
      {hasData ? (
        <>
          <Text>
            Events are already coming in, so you're past the hard part. Have a
            look around your dashboard and reply if anything looks off.
          </Text>
          <Text>
            <Link href={withUtm(dashboardUrl, 'onboarding-welcome')}>
              Open your dashboard
            </Link>
          </Text>
        </>
      ) : (
        <>
          <Text>
            First step is getting data in. The install usually takes a few
            minutes:
          </Text>
          <List
            items={[
              <Link
                href={withUtm(
                  'https://privytics.com/docs',
                  'onboarding-welcome'
                )}
                key="install"
              >
                Install the tracking script
              </Link>,
              <Link
                href={withUtm(
                  'https://privytics.com/docs',
                  'onboarding-welcome'
                )}
                key="track"
              >
                Track custom events
              </Link>,
            ]}
          />
          <Text>If you get stuck, just reply to this email.</Text>
        </>
      )}
      <Text>The Privytics team</Text>
    </Layout>
  );
}

OnboardingWelcome.PreviewProps = {
  firstName: 'Alex',
  dashboardUrl: 'https://app.privytics.com/org-id',
  hasData: false,
};
