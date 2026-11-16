import { op } from '@/utils/op';

// Upstream opened the Userjot widget here and passed it the user's id, name and
// email. Removed (see __root.tsx): it sent personal data to an undisclosed
// third party and the feedback landed on OpenPanel's board. A mailto keeps
// feedback with us and adds no sub-processor.
export const FEEDBACK_MAILTO =
  'mailto:hello@privytics.com?subject=Privytics%20feedback';

export function FeedbackButton({
  className,
  children = 'Give feedback',
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      className={className}
      href={FEEDBACK_MAILTO}
      onClick={() => op.track('feedback_button_clicked')}
    >
      {children}
    </a>
  );
}
