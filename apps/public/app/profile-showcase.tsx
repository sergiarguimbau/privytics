/**
 * The Profiles showcase: the per-user event timeline.
 *
 * Everything below is synthetic, illustrative data. It deliberately does not
 * come from any real project, because a real profile is an actual person's
 * activity inside a customer's product.
 */

type Entry = {
  time: string;
  event: string;
  meta?: string;
  tone?: 'start' | 'signal';
};

// A journey that shows why the timeline is worth looking at: the user set up
// successfully, came back, went to checkout, and dropped at the last step.
const JOURNEY: Entry[] = [
  { time: 'Mon 09:12', event: 'signup_completed', meta: 'plan: free', tone: 'start' },
  { time: 'Mon 09:14', event: 'project_created', meta: 'Acme Web' },
  { time: 'Mon 09:18', event: 'sdk_installed', meta: 'next.js' },
  { time: 'Mon 09:21', event: 'first_event_received' },
  { time: 'Wed 11:40', event: 'dashboard_viewed', meta: '6 times' },
  { time: 'Thu 14:02', event: 'pricing_viewed', meta: '3 times' },
  { time: 'Thu 14:07', event: 'checkout_started', meta: 'plan: 100k' },
  { time: 'Thu 14:09', event: 'checkout_abandoned', tone: 'signal' },
];

export function ProfileShowcase() {
  return (
    <figure className="profile-card">
      <figcaption className="profile-card-tag">Example profile</figcaption>

      <div className="profile-head">
        <span className="profile-avatar" aria-hidden="true">
          AK
        </span>
        <div>
          <p className="profile-name">Ada K.</p>
          <p className="profile-sub">
            <code>user_8f2c41</code> · first seen 4 days ago · 47 events
          </p>
        </div>
      </div>

      <ol className="timeline">
        {JOURNEY.map((entry) => (
          <li
            className={entry.tone ? `timeline-item is-${entry.tone}` : 'timeline-item'}
            key={`${entry.time}-${entry.event}`}
          >
            <span className="timeline-time">{entry.time}</span>
            <span className="timeline-dot" aria-hidden="true" />
            <span className="timeline-body">
              <code className="timeline-event">{entry.event}</code>
              {entry.meta ? (
                <span className="timeline-meta">{entry.meta}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      <p className="profile-insight">
        Ada set up on Monday, came back twice, then dropped at checkout.
        That is a conversation to have, not a number on a chart.
      </p>
    </figure>
  );
}
