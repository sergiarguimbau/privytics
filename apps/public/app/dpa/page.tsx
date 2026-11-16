import { pageMetadata } from '../page-metadata';
import { DPA_MD } from '../legal/content';
import { LegalPage } from '../legal/legal-page';

export const metadata = pageMetadata({
  path: '/dpa',
  title: 'Data Processing Agreement',
  description: 'The GDPR Article 28 DPA between you and Privytics.',
});

export default function Page() {
  return <LegalPage content={DPA_MD} />;
}
