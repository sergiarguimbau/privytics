import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Widget, WidgetHead } from '@/components/widget';
import { BRAND } from '@/brand';

const questions = [
  {
    question: 'Is there a free plan?',
    answer: [
      'Yes. Every account gets 10,000 events a month, free forever, with no credit card. You only pay when you outgrow it.',
    ],
  },
  {
    question: 'What happens if I go over my limit?',
    answer: [
      'On the free plan, new events pause until your next billing period and we prompt you to upgrade.',
      'On a paid plan we let you keep tracking and send you a heads up to move to the next tier, so you never lose data at the boundary.',
    ],
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer: [
      'You keep access until the end of your current billing period, and you can reactivate anytime.',
      'After that you stay on the free plan. If an account records no events for 3 months, we may delete its old data.',
    ],
  },
  {
    question: 'How do I change my billing information?',
    answer: [
      'Open the billing section and click "Customer portal" to manage your plan, payment method, and invoices.',
    ],
  },
  {
    question: 'We need a custom plan, can you help?',
    answer: [
      `Yes. For more than 10 million events a month or other custom needs, contact us at ${BRAND.supportEmail} for a quote.`,
    ],
  },
];

export function BillingFaq() {
  return (
    <Widget className="w-full">
      <WidgetHead className="flex items-center justify-between">
        <span className="title">Frequently asked questions</span>
      </WidgetHead>
      <Accordion
        className="w-full max-w-screen-md self-center"
        collapsible
        type="single"
      >
        {questions.map((q) => (
          <AccordionItem key={q.question} value={q.question}>
            <AccordionTrigger className="px-4 text-left">
              {q.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="col gap-2 p-4 pt-2">
                {q.answer.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Widget>
  );
}
