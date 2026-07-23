import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
    return <div className={cn('animate-pulse rounded-2xl bg-[var(--panel-soft)]', className)} {...props} />;
}

export { Skeleton };