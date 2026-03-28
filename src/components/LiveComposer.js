import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Lock, Send, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';

function LiveComposer({ messageValue, onMessageChange, onSendMessage, typingText, disabled, isSending, isFirebaseReady, isLoading, encryptedLabel, chatBackground }) {
    const [showConnectionText, setShowConnectionText] = useState(false);
    const [showEncryptionText, setShowEncryptionText] = useState(false);
    const connectionTimerRef = useRef(null);
    const encryptionTimerRef = useRef(null);

    const revealBadgeText = (type) => {
        const isConnection = type === 'connection';
        const timerRef = isConnection ? connectionTimerRef : encryptionTimerRef;
        const setVisible = isConnection ? setShowConnectionText : setShowEncryptionText;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setVisible(true);
        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, 1800);
    };

    const connectionText = isFirebaseReady ? 'Secure chat connected' : 'Firebase not configured';
    const encryptionText = encryptedLabel || 'Encrypted chat';

    useEffect(() => {
        return () => {
            if (connectionTimerRef.current) {
                clearTimeout(connectionTimerRef.current);
            }
            if (encryptionTimerRef.current) {
                clearTimeout(encryptionTimerRef.current);
            }
        };
    }, []);

    return (
        <div
            className="sticky bottom-0 relative border-t border-white/22 bg-white/12 px-2.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_28px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-slate-300/14 dark:bg-slate-950/18 md:px-5 md:py-2"
            style={{
                backgroundImage: 'linear-gradient(180deg, rgba(8,15,28,0.22), rgba(8,15,28,0.08)), linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                backgroundPosition: 'center bottom, center center',
                backgroundRepeat: 'no-repeat, no-repeat'
            }}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/18 to-transparent dark:from-white/10" />

            <div className="relative z-10 mx-auto w-full max-w-4xl">
                <div className="mb-1 flex items-center justify-between gap-1.5 text-[10px] text-slate-100 md:mb-1.5 md:gap-2 md:text-[11px]">
                    <button
                        type="button"
                        onMouseEnter={() => revealBadgeText('connection')}
                        onClick={() => revealBadgeText('connection')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/24 p-0 shadow-[0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-all duration-200 hover:bg-white/34 dark:border-slate-300/20 dark:bg-slate-900/34 dark:hover:bg-slate-900/44 md:h-8 md:w-8"
                        aria-label={connectionText}
                        title={connectionText}
                    >
                        {isFirebaseReady ? <Wifi size={14} /> : <WifiOff size={14} />}
                    </button>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onMouseEnter={() => revealBadgeText('encryption')}
                            onClick={() => revealBadgeText('encryption')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/24 p-0 shadow-[0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-all duration-200 hover:bg-white/34 dark:border-slate-300/20 dark:bg-slate-900/34 dark:hover:bg-slate-900/44 md:h-8 md:w-8"
                            aria-label={encryptionText}
                            title={encryptionText}
                        >
                            <Lock size={13} />
                        </button>
                        {isLoading ? (
                            <span
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/24 p-0 shadow-[0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur-lg dark:border-slate-300/20 dark:bg-slate-900/34 md:h-8 md:w-8"
                                title="Syncing"
                                aria-label="Syncing"
                            >
                                <LoaderCircle size={12} className="animate-spin" />
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mb-0.5 min-h-4 pl-1 md:mb-1">
                    {typingText ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/30 px-2 py-0.5 text-[11px] text-slate-100 shadow-sm backdrop-blur dark:border-slate-300/25 dark:bg-white/12 dark:text-slate-100">
                            <span className="inline-flex items-center gap-[3px]">
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                                <span className="typing-bubble-dot" style={{ backgroundColor: 'currentColor' }} />
                            </span>
                            <span>{typingText}</span>
                        </span>
                    ) : null}
                </div>

                <div className="rounded-[1.4rem] border border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-300/15 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.48),rgba(2,6,23,0.18))] md:p-2">
                    <div className="flex items-end gap-1.5 md:gap-2">
                        <textarea
                            value={messageValue}
                            onChange={(event) => onMessageChange(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    onSendMessage();
                                }
                            }}
                            placeholder="Type a message"
                            rows={1}
                            className="max-h-24 min-h-9 w-full resize-y rounded-[1.2rem] border border-white/38 bg-white/34 px-3 py-2 text-sm leading-normal text-[var(--text-main)] shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl outline-none ring-0 transition-all duration-200 focus:border-emerald-400/65 focus:bg-white/42 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_12px_30px_rgba(15,23,42,0.14)] dark:border-slate-300/20 dark:bg-slate-900/36 dark:focus:bg-slate-900/46 md:min-h-10 md:rounded-[1.35rem] md:px-3.5 md:py-2.5"
                        />
                        <Button
                            type="button"
                            className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 p-0 text-white shadow-[0_10px_20px_rgba(16,185,129,0.22)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(16,185,129,0.28)]"
                            onClick={onSendMessage}
                            disabled={disabled || isSending}
                            aria-label="Send message"
                        >
                            {isSending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveComposer;
