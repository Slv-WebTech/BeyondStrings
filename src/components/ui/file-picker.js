import { useMemo } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

function FilePicker({
    id,
    accept,
    onFileSelect,
    placeholder = 'Choose file',
    className,
    buttonLabel = 'Browse',
    icon = true
}) {
    const inputId = useMemo(() => id || `file-picker-${Math.random().toString(36).slice(2, 8)}`, [id]);

    return (
        <div className={cn('flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-1', className)}>
            <input
                id={inputId}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => onFileSelect(event.target.files?.[0])}
            />

            <label htmlFor={inputId} className="min-w-0 flex-1 cursor-pointer truncate px-3 text-sm text-[var(--text-muted)]">
                {placeholder}
            </label>

            <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={() => document.getElementById(inputId)?.click()}>
                {icon ? <Paperclip size={14} /> : null}
                {buttonLabel}
            </Button>
        </div>
    );
}

export { FilePicker };