import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  children,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn('col md:row gap-2', className)}>
      <div className={'flex-1 space-y-1'}>
        <h1 className="font-semibold text-xl">{title}</h1>
        {description && (
          <p className="font-medium text-base text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      {/* items-start matters: `md:row` above is a flex row whose default
          align-items is `stretch`, so this box would otherwise stretch to the
          full height of the title block (three lines on tablet). Action buttons
          set explicit heights so they ignore that, but a wrapper like the
          search field's `relative` div does not; its absolutely positioned
          icon then centres against the stretched box instead of the input, and
          drifts far below it. Mobile was unaffected because `col` applies
          there. */}
      <div className="row flex-wrap items-start gap-2">{actions}</div>
    </div>
  );
}
