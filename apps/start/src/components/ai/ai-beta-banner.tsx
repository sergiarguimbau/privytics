import {
  BookOpenIcon,
  FlaskConicalIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { FeedbackButton } from '@/components/feedback-button';
import Syntax from '@/components/syntax';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppContext } from '@/hooks/use-app-context';
import { cn } from '@/utils/cn';

// Privytics: there is no Privytics page for this yet. The upstream guide omits
// apiUrl, and the published SDK then posts prompts to api.openpanel.dev, so the
// banner shows the init line with apiUrl next to the link.
export const AI_DOCS_URL = 'https://openpanel.dev/docs/ai-observability';

const sdkSnippet = (apiUrl: string) =>
  `import { OpenPanel } from '@openpanel/sdk';

const op = new OpenPanel({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  apiUrl: '${apiUrl}',
});`;

const ACTION_CLASS =
  'row h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 font-medium text-foreground text-xs transition-colors hover:bg-def-100';

/**
 * Shown on every AI page while the feature is in beta: the payload and the
 * pages may still change, and feedback is what decides how.
 */
export function AiBetaBanner({ className }: { className?: string }) {
  const { apiUrl } = useAppContext();
  return (
    <Alert className={cn('border-chart-0/40 bg-chart-0/5', className)}>
      <FlaskConicalIcon className="size-4" />
      <AlertTitle>AI observability is in beta</AlertTitle>
      <AlertDescription className="col gap-3 text-muted-foreground">
        <p>
          We are shaping this with the people who use it. How events are sent
          and what these pages show may change before it is final, but events
          you have already sent stay readable. Tell us what you are trying to
          learn about your AI features and what is missing.
        </p>
        <p>
          Privytics runs the open-source OpenPanel engine and uses its SDKs, so
          the docs are OpenPanel's. Independent service, not affiliated with
          OpenPanel. Always set apiUrl to {apiUrl} when you create the SDK
          instance. Without it, your AI events, prompts included, are sent to
          OpenPanel instead of Privytics.
        </p>
        <Syntax className="border" code={sdkSnippet(apiUrl)} />
        <div className="row flex-wrap gap-2">
          <FeedbackButton className={ACTION_CLASS}>
            <MessageSquareIcon className="size-3.5" />
            Give feedback
          </FeedbackButton>
          <a
            className={ACTION_CLASS}
            href={AI_DOCS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <BookOpenIcon className="size-3.5" />
            Read the docs
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}
