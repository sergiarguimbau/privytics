import { Text } from '@react-email/components';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zUsageNearLimit = z.object({
  firstName: z.string().optional(),
  organizationName: z.string(),
  billingUrl: z.string(),
  eventsCount: z.number(),
  eventsLimit: z.number(),
  isFreePlan: z.boolean().default(false),
});

const formatNumber = (count: number) =>
  new Intl.NumberFormat('en-US').format(count);

export type Props = z.infer<typeof zUsageNearLimit>;
export default UsageNearLimit;
export function UsageNearLimit({
  firstName,
  organizationName,
  billingUrl = 'https://app.privytics.com',
  eventsCount,
  eventsLimit,
  isFreePlan,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const percent = Math.round((eventsCount / eventsLimit) * 100);
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
      <Text>
        Heads up: {organizationName} has used {formatNumber(eventsCount)} of its{' '}
        {formatNumber(eventsLimit)} monthly events ({percent}%).
      </Text>
      {isFreePlan ? (
        <Text>
          Once you reach the limit, new events are not collected until next
          month starts or you choose a plan. Everything collected before that
          is safe.
        </Text>
      ) : (
        <Text>
          If you go over the limit, we keep collecting every event, so nothing
          is lost, but your charts stop showing new data until you upgrade or
          the next billing cycle starts.
        </Text>
      )}
      <Text>
        <Button href={withUtm(billingUrl, 'usage-near-limit')}>
          See usage &amp; plans
        </Button>
      </Text>
      <Text>
        Questions about which plan fits? Reply to this email and I'll help you
        pick.
      </Text>
      <Text>The Privytics team</Text>
    </Layout>
  );
}

UsageNearLimit.PreviewProps = {
  firstName: 'Alex',
  organizationName: 'Acme',
  billingUrl: 'https://app.privytics.com/org-id/billing',
  eventsCount: 4200,
  eventsLimit: 5000,
};
