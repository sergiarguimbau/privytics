import { useEffect, useState } from 'react';
import { ChatPreview } from './chat-preview';
import { BRAND } from '@/brand';
import { cn } from '@/utils/cn';

const ROTATE_EVERY_MS = 7000;

// Privytics: product value propositions, not customer quotes, so they stay
// honest for a new service. Upstream's customer testimonials are not ours.
const TESTIMONIALS: { quote: string; author: string; site?: string }[] = [
  {
    quote:
      'Funnels, retention, and session replay. The depth of the big tools, without the mess.',
    author: BRAND.name,
  },
  {
    quote:
      'Cookieless by default. No banner to add, and analytics data stored in the EU.',
    author: BRAND.name,
  },
  {
    quote:
      'Your first 10,000 events every month are free, forever. No credit card.',
    author: BRAND.name,
  },
  {
    quote:
      'Own your data. Export it anytime, or self-host the open-source engine.',
    author: BRAND.name,
  },
];

function useRotatingIndex(length: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % length),
      ROTATE_EVERY_MS
    );
    return () => window.clearInterval(timer);
  }, [length]);
  return [index, setIndex] as const;
}

export function AuthShowcase() {
  const [index, setIndex] = useRotatingIndex(TESTIMONIALS.length);
  const testimonial = TESTIMONIALS[index] ?? TESTIMONIALS[0]!;

  return (
    // Pinned to the viewport so the page height never follows the chat
    // replay; the replay takes whatever height is left between the headline
    // and the testimonial, which always sits at the bottom.
    <aside className="relative hidden overflow-hidden lg:sticky lg:top-3 lg:m-3 lg:flex lg:h-[calc(100vh-1.5rem)] lg:flex-col lg:self-start lg:rounded-2xl lg:bg-def-200 lg:p-12 xl:p-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-highlight/10 blur-3xl"
      />
      <div className="col relative max-w-lg shrink-0 gap-4">
        <h2 className="font-semibold text-3xl leading-tight tracking-tight">
          Ask your analytics a question. Get the chart back.
        </h2>
        <p className="text-base text-muted-foreground [@media(max-height:820px)]:hidden">
          Web and product analytics in one place, open source, and, on paid
          plans, a chat that answers with charts.
        </p>
      </div>
      <div className="relative mt-6 min-h-0 max-w-lg flex-1">
        <ChatPreview className="h-full" />
      </div>

      <figure className="col relative mt-6 max-w-lg shrink-0 gap-5 rounded-xl bg-background p-6 shadow-sm">
        <blockquote
          className="fade-in animate-in text-base leading-relaxed duration-500 motion-reduce:animate-none"
          key={testimonial.quote}
        >
          “{testimonial.quote}”
        </blockquote>
        <div className="row items-center justify-between gap-4">
          <figcaption className="text-sm">
            <span className="font-medium">{testimonial.author}</span>
            {testimonial.site && (
              <span className="text-muted-foreground">
                {' '}
                · {testimonial.site}
              </span>
            )}
          </figcaption>
          <div aria-hidden="true" className="row gap-1.5">
            {TESTIMONIALS.map((item, dotIndex) => (
              <button
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  dotIndex === index
                    ? 'w-5 bg-foreground'
                    : 'w-1.5 bg-def-400 hover:bg-foreground/60'
                )}
                key={item.quote}
                onClick={() => setIndex(dotIndex)}
                tabIndex={-1}
                type="button"
              />
            ))}
          </div>
        </div>
      </figure>
    </aside>
  );
}
