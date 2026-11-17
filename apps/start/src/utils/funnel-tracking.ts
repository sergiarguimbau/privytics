import { useCallback, useRef } from 'react';
import { op } from '@/utils/op';

/**
 * Everything the sign-up → first-event funnel reports about itself, so the
 * flow can be judged on data later. One name per decision a visitor makes;
 * properties say which option they picked and how long the step took.
 *
 * Funnel order: auth_page_viewed → auth_provider_clicked →
 * auth_signup_succeeded | auth_signin_succeeded → onboarding_project_viewed →
 * onboarding_project_created → onboarding_connect_viewed →
 * onboarding_first_event_verified | onboarding_skipped →
 * onboarding_dashboard_opened. Everything else explains the gaps.
 */
export type FunnelEvent =
  | 'auth_page_viewed'
  | 'auth_provider_clicked'
  | 'auth_form_invalid'
  | 'auth_signup_succeeded'
  | 'auth_signup_failed'
  | 'auth_signin_succeeded'
  | 'auth_signin_failed'
  | 'auth_forgot_password_clicked'
  | 'onboarding_project_viewed'
  | 'onboarding_workspace_mode_changed'
  | 'onboarding_workspace_settings_toggled'
  | 'onboarding_project_type_toggled'
  | 'onboarding_extra_domains_toggled'
  | 'onboarding_project_invalid'
  | 'onboarding_project_created'
  | 'onboarding_project_create_failed'
  | 'onboarding_connect_viewed'
  | 'onboarding_install_method_selected'
  | 'onboarding_framework_selected'
  | 'onboarding_framework_guide_clicked'
  | 'onboarding_snippet_copied'
  | 'onboarding_ai_framework_selected'
  | 'onboarding_ai_prompt_copied'
  | 'onboarding_ai_prompt_opened_in_cursor'
  | 'onboarding_credentials_copied'
  | 'onboarding_mcp_connect_toggled'
  | 'onboarding_mcp_connect_clicked'
  | 'onboarding_mcp_settings_clicked'
  | 'onboarding_troubleshooting_toggled'
  | 'onboarding_allowed_domains_updated'
  | 'onboarding_test_curl_copied'
  | 'onboarding_support_link_clicked'
  | 'onboarding_assistant_opened'
  | 'onboarding_first_event_verified'
  | 'onboarding_skipped'
  | 'onboarding_dashboard_opened'
  | 'onboarding_signed_out';

export type FunnelProperties = Record<
  string,
  string | number | boolean | null | undefined | string[]
>;

export function trackFunnel(name: FunnelEvent, properties?: FunnelProperties) {
  op.track(name, properties);
}

// What an account does once it is set up, recorded from the one place every
// tRPC mutation passes (the query client's MutationCache). Only the event name
// is sent: inputs carry report names and filter values, which can hold a
// customer's end-user data.
const ACTIVATION_EVENTS: Record<string, string> = {
  'project.create': 'project_created',
  'client.create': 'client_created',
  'dashboard.create': 'dashboard_created',
  'report.create': 'report_created',
  'organization.inviteUser': 'member_invited',
  'organization.acceptInvite': 'invite_accepted',
  'share.createDashboard': 'dashboard_shared',
  'share.createOverview': 'overview_shared',
  'share.createReport': 'report_shared',
  'integration.createOrUpdate': 'integration_saved',
  'integration.createOrUpdateSlack': 'integration_saved',
  'integration.createOrUpdateExport': 'export_saved',
  'notification.createOrUpdateRule': 'notification_rule_saved',
  'project.delete': 'project_deleted',
  'organization.delete': 'organization_deleted',
};

/** Tracks a succeeded mutation if it is one of the activation steps above. */
export function trackActivation(mutationKey: readonly unknown[] | undefined) {
  const path = mutationKey?.[0];
  const name = Array.isArray(path) ? ACTIVATION_EVENTS[path.join('.')] : undefined;
  if (name) {
    op.track(name);
  }
}

/** Seconds since the step mounted, attached to the events that end a step. */
export function useSecondsOnStep() {
  const mountedAt = useRef(Date.now());
  return useCallback(
    () => Math.round((Date.now() - mountedAt.current) / 1000),
    []
  );
}

/** The error text when the API refused, trimmed so it groups in reports. */
export function failureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 80);
}
