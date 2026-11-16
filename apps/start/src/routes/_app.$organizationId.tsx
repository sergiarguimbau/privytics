import { getSubscriptionStateMeta } from '@openpanel/payments/subscription-state-meta';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  notFound,
  Outlet,
  useLocation,
} from '@tanstack/react-router';
import { format } from 'date-fns';
import { Building2Icon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import FullPageLoadingState from '@/components/full-page-loading-state';
import FeedbackPrompt from '@/components/organization/feedback-prompt';
import { isOnFreeLimits } from '@/components/organization/plan-state';
import YearlySwitchPrompt from '@/components/organization/yearly-switch-prompt';
import { LinkButton } from '@/components/ui/button';
import { useTRPC } from '@/integrations/trpc/react';
import { cn } from '@/utils/cn';

const IGNORE_ORGANIZATION_IDS = ['.well-known', 'onboarding', 'assets'];

const FILE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'tiff',
  'ico',
  'js',
  'xml',
  'txt',
  'json',
  'webmanifest',
];

const isStaticFile = (path: string) => {
  return FILE_EXTENSIONS.some((extension) => path.endsWith(`.${extension}`));
};

export const Route = createFileRoute('/_app/$organizationId')({
  component: Component,
  beforeLoad: async ({ context, params }) => {
    if (IGNORE_ORGANIZATION_IDS.includes(params.organizationId)) {
      throw notFound();
    }
    if (isStaticFile(params.organizationId)) {
      throw notFound();
    }
    // Single source of truth for "can this user see this org?". myAccess is
    // membership-exempt and returns null for non-members (and non-existent
    // orgs), which we surface as a not-found page. Real errors (network/500)
    // reject and fall through to the errorComponent. Runs before child routes,
    // so it short-circuits settings/index/billing/members/project.
    const access = await context.queryClient.fetchQuery(
      context.trpc.organization.myAccess.queryOptions({
        organizationId: params.organizationId,
      })
    );
    if (access === null) {
      throw notFound();
    }
  },
  loader: async ({ context, params }) => {
    // myAccess is already warmed in beforeLoad; only organization.get remains.
    await context.queryClient.prefetchQuery(
      context.trpc.organization.get.queryOptions({
        organizationId: params.organizationId,
      })
    );
  },
  pendingComponent: FullPageLoadingState,
  notFoundComponent: () => (
    <EmptyState
      description="This workspace doesn't exist or you don't have access to it."
      icon={Building2Icon}
      title="Workspace not found"
      variant="page"
    >
      <LinkButton href="/">Go to home</LinkButton>
    </EmptyState>
  ),
});

function Alert({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  const location = useLocation();

  // Hide on billing page
  if (location.pathname.match(/\/.+\/billing/)) {
    return null;
  }

  return (
    <div className={cn('col gap-1 border-b bg-card p-4 lg:p-8', className)}>
      <div className="font-medium text-lg">{title}</div>
      <div className="mb-1">{description}</div>
      <div className="row gap-2">{children}</div>
    </div>
  );
}

function Component() {
  const { organizationId } = Route.useParams();
  const trpc = useTRPC();
  const { data: organization } = useSuspenseQuery(
    trpc.organization.get.queryOptions({
      organizationId,
    })
  );

  const stateMeta = getSubscriptionStateMeta(organization.subscriptionState, {
    endsAt: organization.subscriptionEndsAt,
    canceledAt: organization.subscriptionCanceledAt,
    resumesAt: organization.subscriptionResumesAt,
  });

  // Nothing blocks the dashboard (the free tier is the floor), so there is no
  // full-screen prompt to avoid stacking the banner on top of.

  // The free plan is hard-capped at ingestion: events over the allowance are
  // rejected, not stored. Paid plans are soft-capped: events keep coming in and
  // only the charts pause. The usage banners must not promise the free plan
  // what only paid plans do. A paused org, or one with an unpaid checkout, is
  // held to the free plan's cap.
  const isFreePlan = isOnFreeLimits(organization);
  // isActive is false while paused or incomplete, but the cap still applies.
  const showsUsage = organization.isActive || isFreePlan;
  // Checkout is refused while paused: resuming is the way out of the cap.
  const isPaused = organization.subscriptionState === 'paused';
  const freeCapLiftsWhen = isPaused
    ? 'next month starts or you resume your subscription'
    : 'next month starts or you choose a plan';
  const usagePercent =
    organization.subscriptionPeriodEventsLimit > 0
      ? Math.round(
          (organization.subscriptionPeriodEventsCount /
            organization.subscriptionPeriodEventsLimit) *
            100
        )
      : 0;
  const eventsLimitLabel =
    organization.subscriptionPeriodEventsLimit.toLocaleString();

  const location = useLocation();
  const isBillingPage = /\/.+\/billing/.test(location.pathname);

  return (
    <>
      {!(stateMeta.banner || isBillingPage) && (
        <YearlySwitchPrompt organization={organization} />
      )}
      {stateMeta.banner && (
        <Alert
          description={stateMeta.banner.description}
          title={stateMeta.banner.title}
        >
          <LinkButton
            params={{
              organizationId,
            }}
            to="/$organizationId/billing"
          >
            {stateMeta.banner.cta}
          </LinkButton>
        </Alert>
      )}
      {showsUsage &&
        !organization.isExceeded &&
        organization.subscriptionPeriodEventsLimit > 0 &&
        organization.subscriptionPeriodEventsCount >=
          organization.subscriptionPeriodEventsLimit * 0.8 && (
          <Alert
            description={
              isFreePlan
                ? `You've used ${usagePercent}% of your ${eventsLimitLabel} free monthly events. Once you reach the limit, new events are not collected until ${freeCapLiftsWhen}.`
                : `You've used ${usagePercent}% of your ${eventsLimitLabel} monthly events. If you go over, we keep collecting your events but charts pause until you upgrade.`
            }
            title="Approaching your events limit"
          >
            <LinkButton
              params={{
                organizationId,
              }}
              to="/$organizationId/billing"
            >
              {isPaused ? 'Resume subscription' : 'See plans'}
            </LinkButton>
          </Alert>
        )}
      {organization.subscriptionPeriodEventsCountExceededAt &&
        showsUsage &&
        organization.isExceeded && (
          <Alert
            description={
              isFreePlan
                ? `You hit your free monthly events limit on ${format(organization.subscriptionPeriodEventsCountExceededAt, 'PPP')}. New events are not being collected until ${freeCapLiftsWhen}. Everything collected before that is safe.`
                : `You hit your monthly events limit on ${format(organization.subscriptionPeriodEventsCountExceededAt, 'PPP')}. We're still collecting your events, so nothing is lost, but charts won't show new data until you upgrade or your next cycle starts.`
            }
            title="Events limit exceeded"
          >
            <LinkButton
              params={{
                organizationId,
              }}
              to="/$organizationId/billing"
            >
              {isPaused ? 'Resume subscription' : 'Upgrade now'}
            </LinkButton>
          </Alert>
        )}
      <Outlet />
      <FeedbackPrompt />
    </>
  );
}
