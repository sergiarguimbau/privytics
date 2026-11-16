import { pageMetadata } from '../page-metadata';
import { DOCS_MD } from '../legal/content';
import { LegalPage } from '../legal/legal-page';

// /docs is a money page for "privytics docs" and long-tail install queries;
// the bare title "Documentation" carried zero query terms.
export const metadata = pageMetadata({
  path: '/docs',
  // The layout template appends "| Privytics", so the title must not start
  // with the brand or it renders twice.
  title: 'Docs: install analytics, track events, identify users',
  description:
    'Install Privytics cookieless analytics with a script tag or npm package, track custom events, identify users, and enable session replay. Working code included.',
});

export default function Page() {
  return <LegalPage content={DOCS_MD} />;
}
