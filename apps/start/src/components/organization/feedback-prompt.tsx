import { useLocation } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { FEEDBACK_MAILTO } from '@/components/feedback-button';
import { PromptCard } from '@/components/organization/prompt-card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import { useCookieStore } from '@/hooks/use-cookie-store';
import { op } from '@/utils/op';

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export default function FeedbackPrompt() {
  const { isSelfHosted, isDemo } = useAppContext();
  // The chat page owns the bottom of the screen; the card would cover the composer.
  const onChatPage = useLocation().pathname.endsWith('/chat');
  const [feedbackPromptSeen, setFeedbackPromptSeen] = useCookieStore(
    'feedback-prompt-seen',
    '',
    { maxAge: THIRTY_DAYS_IN_SECONDS }
  );

  const shouldShow = useMemo(() => {
    if (isSelfHosted || onChatPage) {
      return false;
    }

    if (isDemo) {
      return false;
    }

    if (!feedbackPromptSeen) {
      return true;
    }

    try {
      const lastSeenDate = new Date(feedbackPromptSeen);
      const now = new Date();
      const daysSinceLastSeen =
        (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);

      return daysSinceLastSeen >= 30;
    } catch {
      // If date parsing fails, show the prompt
      return true;
    }
  }, [isDemo, isSelfHosted, onChatPage, feedbackPromptSeen]);

  const handleGiveFeedback = () => {
    // Upstream opened the Userjot widget here; see __root.tsx for why it is
    // gone. Feedback reaches us by email instead, via the link below.
    setFeedbackPromptSeen(new Date().toISOString());
    op.track('feedback_prompt_button_clicked');
  };

  const handleClose = () => {
    // Set cookie with current timestamp when closed
    setFeedbackPromptSeen(new Date().toISOString());
  };

  useEffect(() => {
    if (shouldShow) {
      op.track('feedback_prompt_viewed');
    }
  }, [shouldShow]);

  return (
    <PromptCard
      gradientColor="rgb(12 107 105)"
      onClose={handleClose}
      show={shouldShow}
      subtitle="Help us improve Privytics with your insights"
      title="Share Your Feedback"
    >
      <div className="col gap-4 px-6">
        <p className="text-foreground text-sm">
          Your feedback helps us build features you actually need. Share your
          thoughts, report bugs, or suggest improvements
        </p>

        <Button asChild className="self-start" onClick={handleGiveFeedback}>
          <a href={FEEDBACK_MAILTO}>Give Feedback</a>
        </Button>
      </div>
    </PromptCard>
  );
}
