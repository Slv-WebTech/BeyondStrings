import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] hover:-translate-y-0.5',
                secondary: 'border border-[var(--border-soft)] bg-[var(--panel)] text-[var(--text-main)] shadow-sm hover:bg-[var(--panel-soft)]',
                ghost: 'text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-main)]',
                outline: 'border border-[var(--border-soft)] bg-transparent text-[var(--text-main)] hover:bg-[var(--panel-soft)]'
            },
            size: {
                default: 'h-11 px-4 py-2.5',
                sm: 'h-9 rounded-xl px-3',
                icon: 'h-10 w-10 rounded-full'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Button({ className, variant, size, ...props }) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };