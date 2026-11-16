import { pageMetadata } from '../page-metadata';
import { TERMS_MD } from '../legal/content';
import { LegalPage } from '../legal/legal-page';

export const metadata = pageMetadata({
  path: '/terms',
  title: 'Terms of Service',
  description: 'The terms that govern your use of Privytics.',
});

export default function Page() {
  return <LegalPage content={TERMS_MD} />;
}
