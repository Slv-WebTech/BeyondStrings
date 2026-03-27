import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

function Select({ children, ...props }) {
    return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

function SelectTrigger({ className, children, ...props }) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                'inline-flex h-11 w-full items-center justify-between rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 text-sm text-[var(--text-main)] outline-none transition focus:ring-2 focus:ring-emerald-400/50',
                className
            )}
            {...props}
        >
            <SelectPrimitive.Value>{children}</SelectPrimitive.Value>
            <SelectPrimitive.Icon>
                <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({ className, children, ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={cn(
                    'z-50 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-1 shadow-2xl backdrop-blur-xl',
                    className
                )}
                {...props}
            >
                <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectItem({ className, children, ...props }) {
    return (
        <SelectPrimitive.Item
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-[var(--text-main)] outline-none transition hover:bg-[var(--panel-soft)]',
                className
            )}
            {...props}
        >
            <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center text-[var(--accent)]">
                <SelectPrimitive.ItemIndicator>
                    <Check size={14} />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

export { Select, SelectTrigger, SelectContent, SelectItem };