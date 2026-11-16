import { pageMetadata } from '../page-metadata';
import { PRIVACY_MD } from '../legal/content';
import { LegalPage } from '../legal/legal-page';

export const metadata = pageMetadata({
  path: '/privacy',
  title: 'Privacy Policy',
  description: 'How Privytics handles personal data.',
});

export default function Page() {
  return <LegalPage content={PRIVACY_MD} />;
}
