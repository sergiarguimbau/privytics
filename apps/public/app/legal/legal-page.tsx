import Markdown from 'react-markdown';
import { SiteFooter } from '../site-footer';
import remarkGfm from 'remark-gfm';

export function LegalPage({ content }: { content: string }) {
  return (
    <div className="legal">
      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
        <a className="legal-back" href="/">
          Back to home
        </a>
      </header>
      <main className="legal-prose">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </main>
      <SiteFooter />
    </div>
  );
}
