import { LogoSquare } from '../logo';
import { AuthShowcase } from './auth-showcase';
import { BRAND } from '@/brand';
import { useAppContext } from '@/hooks/use-app-context';

/** Two columns: the form on the left, social proof on the right. On small screens only the form remains. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { isSelfHosted } = useAppContext();
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between p-6 lg:px-10 lg:py-8">
          <a
            className="row items-center gap-2.5 font-medium"
            href={BRAND.marketingUrl}
          >
            <LogoSquare className="size-8 shrink-0" />
            <span>{BRAND.name}</span>
          </a>
          {isSelfHosted && (
            <span className="rounded-full bg-def-200 px-2.5 py-1 text-muted-foreground text-xs">
              Self-hosted
            </span>
          )}
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-6 lg:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
        <footer className="p-6 text-center text-muted-foreground text-xs lg:px-10">
          <span>Privacy-first product analytics · {BRAND.domain}</span>
        </footer>
      </div>
      <AuthShowcase />
    </div>
  );
}

export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="col gap-2">
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      {description && (
        <p className="text-base text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
