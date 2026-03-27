import { cn } from '../../lib/utils';

function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                'h-11 w-full rounded-full border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-main)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-emerald-400/50',
                className
            )}
            {...props}
        />
    );
}

export { Input };