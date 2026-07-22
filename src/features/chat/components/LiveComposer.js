import { useEffect, useRef, useState } from 'react';
import { FileText, Image, LoaderCircle, Lock, Mic, Paperclip, Send, Smile, Sparkles, Wifi, WifiOff, WandSparkles, X } from 'lucide-react';
import { Button } from '../../../shared/components/UI/button';
import BottomSheet from './BottomSheet';

function LiveComposer({
    messageValue,
    onMessageChange,
    onSendMessage,
    onSendMedia,
    typingText,
    disabled,
    isSending,
    isOnline = true,
    isFirebaseReady,
    isLoading,
    encryptedLabel,
    quickReplies = [],
    onQuickReply,
    onQuickCommand,
    onVoiceInput,
    replyTo,
    onCancelReply
}) {
    const [emojiSheetOpen, setEmojiSheetOpen] = useState(false);
    const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const fileInputRef = useRef(null);
    const QUICK_COMMANDS = [
        { value: '@AI summarize', icon: Sparkles, label: 'Summarize' },
        { value: '@AI explain', icon: WandSparkles, label: 'Explain' },
        { value: '@AI extract tasks', icon: FileText, label: 'Extract tasks' }
    ];
    const textAreaRef = useRef(null);

    const syncTextareaHeight = () => {
        const node = textAreaRef.current;
        if (!node) {
            return;
        }

        node.style.height = 'auto';
        node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
    };

    const connectionText = !isFirebaseReady ? 'Firebase not configured' : !isOnline ? 'Offline' : 'Secure chat connected';
    const encryptionText = encryptedLabel || 'Encrypted chat';

    useEffect(() => {
        syncTextareaHeight();
    }, [messageValue]);

    return (
        <div
            className="live-composer-shell relative bg-gradient-to-t from-[color-mix(in_srgb,var(--text-main)_16%,transparent_84%)] via-[color-mix(in_srgb,var(--text-main)_10%,transparent_90%)] to-transparent px-2.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-[2px] md:px-5 md:py-2"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[color-mix(in_srgb,var(--text-main)_10%,transparent_90%)] to-transparent" />

            <div className="relative z-10 mx-auto w-full max-w-4xl">
                {replyTo ? (
                    <div className="mb-1.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-2 text-[var(--text-main)] md:mb-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">Replying to {replyTo.sender && String(replyTo.sender).trim() ? String(replyTo.sender).trim() : 'message'}</p>
                                <p className="truncate text-xs text-[var(--text-muted)]">{replyTo.message && String(replyTo.message).trim() ? String(replyTo.message).trim() : '(empty message)'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onCancelReply}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--panel)]"
                                aria-label="Cancel reply"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="live-composer-rail composer-action-rail scroll-thin mb-1.5 flex items-center gap-1.5 overflow-x-auto pb-1 whitespace-nowrap md:mb-2">
                    {QUICK_COMMANDS.map((command) => (
                        <button
                            key={command.value}
                            type="button"
                            onClick={() => {
                                if (typeof onQuickCommand === 'function') {
                                    onQuickCommand(command.value);
                                    return;
                                }

                                onMessageChange(command.value);
                            }}
                            className="composer-action-rail__item theme-pill inline-flex h-8 w-8 flex-shrink-0 items-center justify-center !rounded-full !p-0 backdrop-blur transition-colors hover:bg-[var(--panel)]"
                            title={command.label}
                            aria-label={command.label}
                        >
                            <command.icon size={13} />
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={onVoiceInput}
                        className="composer-action-rail__item inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-emerald-400/45 bg-emerald-500/15 text-emerald-500 transition-colors hover:bg-emerald-500/24"
                        title="Voice input"
                        aria-label="Voice input"
                    >
                        <Mic size={13} />
                    </button>

                    <span
                        className="composer-action-rail__item theme-pill inline-flex h-8 w-8 flex-shrink-0 items-center justify-center !rounded-full !p-0"
                        title={connectionText}
                        aria-label={connectionText}
                    >
                        {isFirebaseReady && isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    </span>

                    <span
                        className="composer-action-rail__item theme-pill inline-flex h-8 w-8 flex-shrink-0 items-center justify-center !rounded-full !p-0"
                        title={encryptionText}
                        aria-label={encryptionText}
                    >
                        {isLoading ? <LoaderCircle size={11} className="animate-spin" /> : <Lock size={11} />}
                    </span>
                </div>

                {Array.isArray(quickReplies) && quickReplies.length ? (
                    <div className="mb-1.5 hidden flex-wrap items-center gap-1.5 md:mb-2 md:flex">
                        {quickReplies.slice(0, 2).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onQuickReply?.(item)}
                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--accent)_40%,var(--border-soft)_60%)] bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-main)] shadow-[0_10px_18px_color-mix(in_srgb,var(--accent)_14%,transparent_86%)] transition-transform hover:-translate-y-[1px]"
                            >
                                <WandSparkles size={11} className="text-[var(--accent)]" />
                                <span className="truncate">{item}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                <div className="live-composer-hint mb-0.5 min-h-4 pl-1 md:mb-1">
                    {typingText ? (
                        <span className="theme-pill inline-flex items-center gap-1.5 !rounded-full px-2 py-0.5 text-[11px] shadow-sm backdrop-blur">
                            <span className="inline-flex items-center gap-[3px]">
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                            </span>
                            <span>{typingText}</span>
                        </span>
                    ) : null}

                </div>

                <div className="live-composer-card special-composer-shell premium-panel rounded-[1.4rem] border border-[var(--border-soft)] p-1.5 shadow-[var(--shadow-md)] backdrop-blur-xl md:p-2">
                    <div className="live-composer-input-row flex items-end gap-1 md:gap-2">
                        <div className="mb-1 flex items-center gap-1 md:mb-1.5">
                            <button
                                type="button"
                                onClick={() => setEmojiSheetOpen(true)}
                                className="live-composer-emoji-btn inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--panel-soft)] text-[var(--text-main)] transition-colors hover:bg-[var(--panel)]"
                                aria-label="Open emoji picker"
                            >
                                <Smile size={15} />
                            </button>
                            {typeof onSendMedia === 'function' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSending || uploadProgress !== null}
                                        className="live-composer-attach-btn inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--panel-soft)] text-[var(--text-main)] transition-colors hover:border-sky-400/45 hover:bg-sky-500/15 hover:text-sky-500 disabled:opacity-50"
                                        title="Attach media"
                                        aria-label="Attach media"
                                    >
                                        {uploadProgress !== null ? (
                                            <span className="text-[9px] font-bold leading-none">{uploadProgress}%</span>
                                        ) : (
                                            <Paperclip size={15} />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,audio/*,video/*"
                                        className="sr-only"
                                        aria-hidden="true"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = '';
                                            if (!file) return;
                                            setUploadProgress(0);
                                            try {
                                                await onSendMedia(file, (pct) => setUploadProgress(pct));
                                            } finally {
                                                setUploadProgress(null);
                                            }
                                        }}
                                    />
                                </>
                            ) : null}
                        </div>

                        <textarea
                            ref={textAreaRef}
                            value={messageValue}
                            onChange={(event) => onMessageChange(event.target.value)}
                            onInput={syncTextareaHeight}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    onSendMessage();
                                }
                            }}
                            enterKeyHint="send"
                            autoCapitalize="sentences"
                            autoCorrect="on"
                            spellCheck
                            inputMode="text"
                            placeholder="Type a message"
                            rows={1}
                            className="live-composer-textarea max-h-[140px] min-h-10 w-full resize-none overflow-y-auto rounded-[1.2rem] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[16px] leading-normal text-[var(--text-main)] shadow-[var(--shadow-md)] backdrop-blur-xl outline-none ring-0 transition-all duration-200 focus:border-[color-mix(in_srgb,var(--accent)_65%,white_35%)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-soft)_78%,transparent_22%),var(--shadow-md)] md:min-h-11 md:rounded-[1.35rem] md:px-3.5 md:py-2.5 md:text-sm"
                        />
                        <Button
                            type="button"
                            className="live-composer-send-btn h-11 w-11 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 p-0 text-slate-900 shadow-[0_10px_22px_rgba(34,211,238,0.3)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_30px_rgba(34,211,238,0.34)] disabled:opacity-60 disabled:scale-100 active:scale-95 md:h-12 md:w-12"
                            onClick={() => {
                                onSendMessage();
                                if (navigator.vibrate) {
                                    navigator.vibrate(12);
                                }
                            }}
                            disabled={disabled || isSending}
                            aria-label="Send message"
                        >
                            {isSending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                        </Button>
                    </div>
                </div>
            </div>

            <BottomSheet open={emojiSheetOpen} onOpenChange={setEmojiSheetOpen} title="Emoji picker">
                <div className="grid grid-cols-8 gap-2">
                    {[
                        '😀', '😂', '😍', '😎', '🤔', '🙄', '🥰', '🥲',
                        '❤️', '😭', '🔥', '💯', '👍', '🎉', '😊', '😢',
                        '😡', '😱', '🤩', '🥳', '😴', '🤗', '😏', '🫡',
                        '👋', '🙏', '💪', '🫶', '👀', '🤝', '✌️', '🫂',
                        '🎶', '🌟', '💥', '✨', '🌈', '🍕', '🎮', '🚀',
                        '😤', '🤭', '🫠', '😶', '🫣', '🤫', '🫤', '😬',
                    ].map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                onMessageChange(`${messageValue || ''}${emoji}`);
                                setEmojiSheetOpen(false);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] text-xl transition-colors hover:bg-[var(--panel)]"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </BottomSheet>
        </div>
    );
}

export default LiveComposer;
