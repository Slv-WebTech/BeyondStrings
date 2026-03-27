import { cn } from '../../lib/utils';

function Card({ className, ...props }) {
    return (
        <div
            className={cn(
                'rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--panel)] shadow-[var(--shadow-md)] backdrop-blur-xl',
                className
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }) {
    return <div className={cn('p-5', className)} {...props} />;
}

export { Card, CardContent };