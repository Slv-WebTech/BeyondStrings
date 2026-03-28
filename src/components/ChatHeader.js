import { BarChart3, CalendarClock, ChevronDown, ChevronUp, Download, Lock, LogOut, MoonStar, MoreVertical, Search, Settings2, Sparkles, SunMedium, Upload, Video } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

function ChatHeader({
    title,
    avatar,
    theme,
    onThemeChange,
    contactMeta,
    search,
    onSearchChange,
    resultCount,
    activeMatchIndex,
    onSearchPrev,
    onSearchNext,
    onSearchKeyDown,
    onOpenSettings,
    onOpenImport,
    onOpenSummary,
    onExport,
    showSearch,
    onToggleSearch,
    showTimeline,
    onToggleTimeline,
    showInsights,
    onToggleInsights,
    onLogout
}) {
    const shouldReduceMotion = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuContainerRef = useRef(null);
    const statusLine =
        contactMeta?.statusLine ||
        (contactMeta?.isOnline
            ? 'Online'
            : contactMeta?.lastSeenLabel
                ? `Last seen ${contactMeta.lastSeenLabel}`
                : 'Last seen recently');

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handlePointerDown = (event) => {
            if (!menuContainerRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [menuOpen]);

    return (
        <motion.header
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            className="chat-header sticky top-0 z-20 min-h-[3.2rem] border-b border-white/55 bg-white/72 px-3 py-1.5 text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-950/58 dark:text-slate-100 md:min-h-16 md:px-6"
        >
            <div className="chat-header__content mx-auto flex w-full max-w-4xl flex-col gap-1.5 md:gap-2">
                <div className="chat-header__row flex items-center justify-between gap-1.5 md:gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                        <div className="relative">
                            <img
                                src={avatar || 'https://i.pravatar.cc/100?img=12'}
                                alt={title}
                                className="h-8 w-8 rounded-full border border-white/70 object-cover shadow-sm sm:h-9 sm:w-9 md:h-10 md:w-10"
                            />
                            {contactMeta?.isOnline ? (
                                <>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400/70" />
                                </>
                            ) : (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400 dark:border-slate-900" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-[0.9rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[0.95rem] md:text-[1rem]">{title || 'Chat'}</h3>
                            <p className="chat-header__status inline-flex max-w-full items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-300 md:text-xs">
                                <Lock size={11} />
                                {statusLine}
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[11px] text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-300 xl:inline-flex">
                        <CalendarClock size={13} />
                        <span>{contactMeta?.messageCount || 0} msgs</span>
                        <span>•</span>
                        <span>{contactMeta?.activeDayCount || 0} active days</span>
                    </div>

                    <div className="chat-header__actions flex items-center gap-0.5 md:gap-1 lg:gap-1.5">
                        <Button type="button" variant="ghost" size="icon" className="header-icon-button hidden h-10 w-10 md:inline-flex md:h-[2.35rem] md:w-[2.35rem]" aria-label="Video call preview">
                            <Video size={16} />
                        </Button>
                        <Button
                            type="button"
                            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
                            variant="ghost"
                            size="icon"
                            className="header-icon-button h-10 w-10 md:h-[2.2rem] md:w-[2.2rem]"
                            aria-label="Toggle light and dark theme"
                        >
                            {theme === 'light' ? <MoonStar size={16} /> : <SunMedium size={16} />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="header-icon-button hidden h-10 w-10 md:inline-flex md:h-[2.35rem] md:w-[2.35rem]" aria-label="Open settings" onClick={onOpenSettings}>
                            <Settings2 size={16} />
                        </Button>
                        <div ref={menuContainerRef} className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="header-icon-button h-10 w-10 md:h-[2.2rem] md:w-[2.2rem]"
                                aria-label="More actions"
                                onClick={() => setMenuOpen((prev) => !prev)}
                            >
                                <MoreVertical size={16} />
                            </Button>

                            {menuOpen ? (
                                <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-slate-200/80 bg-white/90 p-1 shadow-xl dark:border-slate-700/60 dark:bg-slate-950/90">
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onToggleSearch?.();
                                        }}
                                    >
                                        <Search size={14} />
                                        {showSearch ? 'Hide search' : 'Show search'}
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onToggleTimeline?.();
                                        }}
                                    >
                                        <CalendarClock size={14} />
                                        {showTimeline ? 'Hide timeline' : 'Show timeline'}
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onOpenImport?.();
                                        }}
                                    >
                                        <Upload size={14} />
                                        Import chat
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onOpenSummary?.();
                                        }}
                                    >
                                        <Sparkles size={14} />
                                        Summary
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onOpenSettings?.();
                                        }}
                                    >
                                        <Settings2 size={14} />
                                        Settings
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onToggleInsights?.();
                                        }}
                                    >
                                        <BarChart3 size={14} />
                                        {showInsights ? 'Close Insights' : 'View Insights'}
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onExport?.();
                                        }}
                                    >
                                        <Download size={14} />
                                        Export PNG
                                    </button>
                                    <button
                                        type="button"
                                        className="header-menu-item text-rose-500 dark:text-rose-300"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onLogout?.();
                                        }}
                                    >
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {showSearch ? (
                    <div className="chat-header__search flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 px-1.5 py-1 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55 lg:gap-1.5">
                        <Search size={15} className="text-slate-500 dark:text-slate-300" />
                        <Input
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            onKeyDown={onSearchKeyDown}
                            placeholder="Search in conversation"
                            className="h-7 w-full min-w-0 flex-1 border-slate-200/70 bg-white/70 text-sm text-slate-800 placeholder:text-slate-500 focus:ring-blue-200 dark:border-slate-700/70 dark:bg-slate-900/65 dark:text-slate-100 dark:placeholder:text-slate-400 lg:h-8"
                        />
                        <span className="hidden rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 lg:inline-flex">
                            {search.trim() ? `${Math.min(activeMatchIndex + 1, resultCount || 0)}/${resultCount}` : 'Search'}
                        </span>
                        <div className="hidden items-center gap-1.5 md:inline-flex">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="header-icon-button h-7 w-7"
                                aria-label="Previous search match"
                                onClick={onSearchPrev}
                                disabled={!resultCount}
                            >
                                <ChevronUp size={14} />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="header-icon-button h-7 w-7"
                                aria-label="Next search match"
                                onClick={onSearchNext}
                                disabled={!resultCount}
                            >
                                <ChevronDown size={14} />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.header>
    );
}

export default ChatHeader;
