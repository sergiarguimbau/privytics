import type { IServiceOrganization } from '@openpanel/core';
import { BILLING_CURRENCY } from '@openpanel/payments/prices';
import { getSubscriptionStateMeta } from '@openpanel/payments/subscription-state-meta';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { Widget, WidgetBody, WidgetHead } from '../widget';
import { BillingFaq } from './billing-faq';
import BillingPlanPicker from './billing-plan-picker';
import { projectUsage } from './billing-projection';
import BillingUsage from './billing-usage';
import { hasNoAllowance, isOnFreeLimits, planBadgeLabel } from './plan-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNumber } from '@/hooks/use-numer-formatter';
import useWS from '@/hooks/use-ws';
import { useTRPC } from '@/integrations/trpc/react';
import { pushModal, useOnPushModal } from '@/modals';
import { formatDate } from '@/utils/date';

interface Props {
  organization: IServiceOrganization;
}

export default function Billing({ organization }: Props) {
  const [success, setSuccess] = useQueryState('customer_session_token');
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const number = useNumber();

  const currentProductQuery = useQuery(
    trpc.subscription.getCurrent.queryOptions({
      organizationId: organization.id,
    })
  );

  const portalMutation = useMutation(
    trpc.subscription.portal.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const resumeMutation = useMutation(
    trpc.subscription.resumeSubscription.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.organization.pathFilter());
        queryClient.invalidateQueries(trpc.subscription.pathFilter());
        toast.success('Subscription resumed', {
          description: 'It might take a few seconds to update',
        });
      },
      onError(error) {
        toast.error(error.message);
      },
    })
  );

  const isPauseState =
    organization.subscriptionState === 'pausing' ||
    organization.subscriptionState === 'paused';

  useWS(`/live/organization/${organization.id}`, () => {
    queryClient.invalidateQueries(trpc.organization.pathFilter());
    queryClient.invalidateQueries(trpc.subscription.pathFilter());
  });

  const recurringInterval = organization.subscriptionInterval ?? 'month';

  // Free and paused orgs are held to the free plan's limits, so the product of
  // their last subscription is not their plan.
  const currentProduct = isOnFreeLimits(organization)
    ? null
    : (currentProductQuery.data ?? null);
  const currentPrice = currentProduct?.prices.flatMap((p) =>
    p.amount_type === 'fixed' ? [p] : []
  )[0];

  // What the customer actually pays while a recurring discount applies. A
  // `once` discount only hits the next invoice, so the header keeps the list
  // price and the discount line below explains it.
  const listPrice = currentPrice ? currentPrice.price_amount / 100 : null;
  const discountedPrice = (() => {
    const active = organization.subscriptionDiscount;
    if (!active || listPrice === null || active.duration === 'once') {
      return null;
    }
    if (active.type === 'percentage' && active.basisPoints) {
      return listPrice * (1 - active.basisPoints / 10_000);
    }
    if (active.type === 'fixed' && active.amount) {
      return Math.max(0, listPrice - active.amount / 100);
    }
    return null;
  })();

  // Synced from Polar — covers the cancel-flow save offer and any discount
  // code the customer redeemed. Without this line the card shows the full
  // list price and an applied discount is invisible outside Polar's portal.
  const discount = organization.subscriptionDiscount;
  const renderDiscount = () => {
    if (!discount) {
      return null;
    }
    const value =
      discount.type === 'percentage' && discount.basisPoints
        ? `−${discount.basisPoints / 100}%`
        : discount.amount
          ? `−${number.currency(discount.amount / 100, { currency: BILLING_CURRENCY })}`
          : null;
    if (!value) {
      return null;
    }
    const duration =
      discount.duration === 'repeating' && discount.durationInMonths
        ? `for the next ${discount.durationInMonths} months`
        : discount.duration === 'forever'
          ? 'on every invoice'
          : 'on your next invoice';
    // Deliberately no discount name here: names are often the redeemable code
    // itself, and the save offer's name would advertise what the cancel flow
    // grants. The value + duration is all the customer needs.
    return (
      <p className="mt-1 text-emerald-600 dark:text-emerald-500">
        {value} {duration}
      </p>
    );
  };

  const renderStatus = () => {
    const meta = getSubscriptionStateMeta(organization.subscriptionState, {
      endsAt: organization.subscriptionEndsAt,
      canceledAt: organization.subscriptionCanceledAt,
      resumesAt: organization.subscriptionResumesAt,
    });

    if (!meta.statusLine) {
      return null;
    }

    return (
      <p
        className={
          meta.statusLine.tone === 'destructive'
            ? 'text-destructive'
            : undefined
        }
      >
        {meta.statusLine.text}
      </p>
    );
  };

  const portalButton = (
    <Button
      loading={portalMutation.isPending}
      onClick={() => portalMutation.mutate({ organizationId: organization.id })}
      size="sm"
      variant="outline"
    >
      <svg
        className="mr-2 size-4"
        fill="none"
        height="300"
        viewBox="0 0 300 300"
        width="300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_1_4)">
          <path
            clip-rule="evenodd"
            d="M66.4284 274.26C134.876 320.593 227.925 302.666 274.258 234.219C320.593 165.771 302.666 72.7222 234.218 26.3885C165.77 -19.9451 72.721 -2.0181 26.3873 66.4297C-19.9465 134.877 -2.01938 227.927 66.4284 274.26ZM47.9555 116.67C30.8375 169.263 36.5445 221.893 59.2454 256.373C18.0412 217.361 7.27564 150.307 36.9437 92.318C55.9152 55.2362 87.5665 29.3937 122.5 18.3483C90.5911 36.7105 62.5549 71.8144 47.9555 116.67ZM175.347 283.137C211.377 272.606 244.211 246.385 263.685 208.322C293.101 150.825 282.768 84.4172 242.427 45.2673C264.22 79.7626 269.473 131.542 252.631 183.287C237.615 229.421 208.385 265.239 175.347 283.137ZM183.627 266.229C207.945 245.418 228.016 210.604 236.936 168.79C251.033 102.693 232.551 41.1978 195.112 20.6768C214.97 47.3945 225.022 99.2902 218.824 157.333C214.085 201.724 200.814 240.593 183.627 266.229ZM63.7178 131.844C49.5155 198.43 68.377 260.345 106.374 280.405C85.9962 254.009 75.5969 201.514 81.8758 142.711C86.5375 99.0536 99.4504 60.737 116.225 35.0969C92.2678 55.983 72.5384 90.4892 63.7178 131.844ZM199.834 149.561C200.908 217.473 179.59 272.878 152.222 273.309C124.853 273.742 101.797 219.039 100.724 151.127C99.6511 83.2138 120.968 27.8094 148.337 27.377C175.705 26.9446 198.762 81.648 199.834 149.561Z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_4">
            <rect fill="white" height="300" width="300" />
          </clipPath>
        </defs>
      </svg>
      Customer portal
    </Button>
  );

  useEffect(() => {
    if (success) {
      pushModal('BillingSuccess');
    }
  }, [success]);

  useOnPushModal('BillingSuccess', (open) => {
    if (!open) {
      setSuccess(null);
    }
  });

  // Active subscribers manage an existing plan: current-plan card beside the
  // FAQ, then the usage breakdown across the full width so both charts fit.
  // Plan changes go through the modal.
  if (currentProduct && currentPrice) {
    const eventsLimit = organization.subscriptionPeriodEventsLimit;
    const eventsLeft = Math.max(
      0,
      eventsLimit - organization.subscriptionPeriodEventsCount
    );
    const periodStart = organization.subscriptionCurrentPeriodStart;
    const periodEnd = organization.subscriptionCurrentPeriodEnd;
    const periodLabel =
      periodStart && periodEnd
        ? `${formatDate(periodStart)} – ${formatDate(periodEnd)}`
        : null;
    const projection =
      periodStart && periodEnd
        ? projectUsage({
            used: organization.subscriptionPeriodEventsCount,
            limit: eventsLimit,
            periodStart,
            periodEnd,
            now: new Date(),
          })
        : null;
    const isOverLimit =
      eventsLimit > 0 &&
      organization.subscriptionPeriodEventsCount >= eventsLimit;
    const renderProjection = () => {
      if (isOverLimit) {
        return (
          <p className="text-destructive">
            Limit reached for this period. New events are not shown until the
            next period starts.
          </p>
        );
      }
      if (!projection) {
        return null;
      }
      const pace = `${number.format(Math.round(projection.perDay))} events a day`;
      if (projection.limitReachedAt) {
        return (
          <p className="text-destructive">
            At {pace} the limit is reached around{' '}
            {formatDate(projection.limitReachedAt)}, with about{' '}
            {number.format(projection.projectedTotal)} events by period end.
          </p>
        );
      }
      return (
        <p className="text-muted-foreground">
          At {pace} this period ends at about{' '}
          {number.format(projection.projectedTotal)} events.
        </p>
      );
    };
    return (
      <div className="col gap-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Widget className="w-full">
            <WidgetHead className="flex items-center justify-between gap-4">
              <div className="title flex-1 truncate">{currentProduct.name}</div>
              <div className="text-lg">
                {discountedPrice !== null && (
                  <span className="mr-2 text-muted-foreground line-through">
                    {number.currency(currentPrice.price_amount / 100, {
                      currency: BILLING_CURRENCY,
                    })}
                  </span>
                )}
                <span className="font-bold">
                  {number.currency(
                    discountedPrice ?? currentPrice.price_amount / 100,
                    { currency: BILLING_CURRENCY }
                  )}
                </span>
                <span className="text-muted-foreground">
                  {' / '}
                  {recurringInterval === 'year' ? 'year' : 'month'}
                </span>
              </div>
            </WidgetHead>
            <WidgetBody>
              {renderStatus()}
              {renderDiscount()}
              <div className="col mt-4">
                <div className="row mb-2 items-baseline justify-between gap-4">
                  <div className="font-semibold">
                    {number.format(organization.subscriptionPeriodEventsCount)}{' '}
                    / {number.format(eventsLimit)} events
                  </div>
                  <div className="text-muted-foreground">
                    {number.format(eventsLeft)} left
                  </div>
                </div>
                <Progress
                  size="sm"
                  value={
                    eventsLimit
                      ? (organization.subscriptionPeriodEventsCount /
                          eventsLimit) *
                        100
                      : 0
                  }
                />
                <div className="col mt-2 gap-1">
                  {periodLabel && (
                    <p className="text-muted-foreground">
                      Current period {periodLabel}
                    </p>
                  )}
                  {renderProjection()}
                </div>
                <div className="row mt-4 justify-between">
                  {portalButton}
                  <div className="row gap-2">
                    {isPauseState && (
                      <Button
                        loading={resumeMutation.isPending}
                        onClick={() =>
                          resumeMutation.mutate({
                            organizationId: organization.id,
                          })
                        }
                        size="sm"
                      >
                        {organization.subscriptionState === 'paused'
                          ? 'Resume subscription'
                          : 'Keep subscription'}
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        pushModal('SelectBillingPlan', {
                          organization,
                          currentProduct,
                        })
                      }
                      size="sm"
                      variant={isPauseState ? 'outline' : 'default'}
                    >
                      {organization.isWillBeCanceled
                        ? 'Reactivate subscription'
                        : 'Change subscription'}
                    </Button>
                  </div>
                </div>
              </div>
            </WidgetBody>
          </Widget>

          <BillingFaq />
        </div>

        <BillingUsage organization={organization} />
      </div>
    );
  }

  // No paid plan to manage, so the plan picker is the focus. Privytics has no
  // trial: an organization without a subscription is on the permanent free
  // plan, so this is a slim status strip rather than a countdown.
  //
  // Except when it has no allowance at all. The free 10,000 events cover a
  // user's first organization only, so any later one lands here with a limit of
  // zero and is rejecting events. Calling that "Free plan" would be wrong, and
  // it is also where onboarding drops the user straight after creating such an
  // organization, so it has to explain itself.
  const noAllowance = hasNoAllowance(organization);
  const state = organization.subscriptionState;
  // A live Polar plan whose card above could not render: its product did not
  // load, or it has no fixed price. Not a plan to buy, so no picker.
  const hasPaidPlan =
    organization.hasSubscription &&
    organization.subscriptionProductId !== null &&
    !isOnFreeLimits(organization);
  if (hasPaidPlan && currentProductQuery.isPending) {
    return <div className="card min-h-40" />;
  }
  // Active with no Polar subscription is a plan set up by hand: nothing to buy
  // or cancel here.
  const isCustomPlan =
    (state === 'active' && !organization.subscriptionId) ||
    state === 'self_hosted';
  // Checkout is refused while paused; resuming brings the plan back.
  const canChoosePlan = !(isCustomPlan || hasPaidPlan || state === 'paused');
  const showRetry = hasPaidPlan && currentProductQuery.isError;
  // Invoices and the saved card stay reachable after a pause or a downgrade.
  const showPortal = Boolean(organization.subscriptionCustomerId);
  const eventsLimit = organization.subscriptionPeriodEventsLimit;
  const eventsUsed = organization.subscriptionPeriodEventsCount;

  return (
    <div className="col gap-8">
      <Widget className="w-full">
        <WidgetBody className="col gap-2">
          <div className="row items-center gap-2">
            <Badge variant={noAllowance ? 'destructive' : 'secondary'}>
              {hasPaidPlan ? 'Paid plan' : planBadgeLabel(organization)}
            </Badge>
          </div>
          {noAllowance ? (
            <p className="text-muted-foreground text-sm leading-normal">
              This organization is not collecting events. The free 10,000 events
              a month apply to your first organization only, so this one needs
              its own plan before any data comes in. Choose one below and then
              install the tracking snippet.
            </p>
          ) : (
            <>
              {renderStatus()}
              {state === 'paused' && (
                <p>While paused, your organization is on the free plan.</p>
              )}
              {showRetry && (
                <p>
                  We could not load your plan details. Try again in a moment.
                </p>
              )}
              {(isCustomPlan || (hasPaidPlan && !showRetry)) && (
                <p>
                  Your organization is on a custom plan. To change it, write to
                  support@privytics.com.
                </p>
              )}
              <div className="col mt-2 max-w-md gap-2">
                <div className="row items-baseline justify-between gap-4">
                  <div className="font-semibold">
                    {number.format(eventsUsed)} / {number.format(eventsLimit)}{' '}
                    {hasPaidPlan ? 'events this period' : 'events this month'}
                  </div>
                  <div className="text-muted-foreground">
                    {number.format(Math.max(0, eventsLimit - eventsUsed))} left
                  </div>
                </div>
                <Progress
                  size="sm"
                  value={
                    eventsLimit > 0
                      ? Math.min(100, (eventsUsed / eventsLimit) * 100)
                      : 0
                  }
                />
              </div>
              {(state === 'paused' || showRetry || showPortal) && (
                <div className="row gap-2">
                  {state === 'paused' && (
                    <Button
                      loading={resumeMutation.isPending}
                      onClick={() =>
                        resumeMutation.mutate({
                          organizationId: organization.id,
                        })
                      }
                      size="sm"
                    >
                      Resume subscription
                    </Button>
                  )}
                  {showRetry && (
                    <Button
                      onClick={() => currentProductQuery.refetch()}
                      size="sm"
                      variant="outline"
                    >
                      Try again
                    </Button>
                  )}
                  {showPortal && portalButton}
                </div>
              )}
            </>
          )}
        </WidgetBody>
      </Widget>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {canChoosePlan && (
          <Widget className="w-full self-start">
            <WidgetHead>
              <div className="title">Choose a plan</div>
            </WidgetHead>
            <WidgetBody className="col gap-4">
              <BillingPlanPicker
                currentProduct={currentProduct}
                organization={organization}
              />
            </WidgetBody>
          </Widget>
        )}

        <BillingFaq />
      </div>

      <BillingUsage organization={organization} />
    </div>
  );
}
