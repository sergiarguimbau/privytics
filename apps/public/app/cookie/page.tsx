import { pageMetadata } from '../page-metadata';
import { COOKIE_MD } from '../legal/content';
import { LegalPage } from '../legal/legal-page';

export const metadata = pageMetadata({
  path: '/cookie',
  title: 'Cookie Policy',
  description: 'Privytics analytics is cookieless. Here is what that means.',
});

export default function Page() {
  return <LegalPage content={COOKIE_MD} />;
}
