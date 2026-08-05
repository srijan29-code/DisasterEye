'use client';

import { cn } from '@/lib/utils';

function Progress({ className, value, ...props }: React.ComponentProps<'div'> & { value?: number }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
