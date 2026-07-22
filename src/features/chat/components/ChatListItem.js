import { Archive, MessageCircleMore, Users } from "lucide-react";
import { Button } from '../../../shared/components/UI/button';

function toMillis(value) {
  if (typeof value === "number") {
    return value;
  }

  if (value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value && typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatTimestamp(timestamp) {
  const millis = toMillis(timestamp);
  if (!millis) {
    return "";
  }

  const date = new Date(millis);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatListItem({ chat, isActive, onSelect, currentUserId }) {
  const lastMessageAt = toMillis(chat?.lastMessageAt);
  const lastReadAt = toMillis(chat?.memberMeta?.[currentUserId]?.lastReadAt);
  const lastSenderId = String(chat?.lastSenderId || '').trim();
  const isLatestMessageIncoming = !lastSenderId || String(currentUserId || '').trim() !== lastSenderId;
  const hasDenormalizedUnread = Object.prototype.hasOwnProperty.call(chat || {}, 'unreadCount');
  const denormalizedUnread = Number(chat?.unreadCount);
  const fallbackUnread = lastMessageAt > 0 && lastReadAt < lastMessageAt && isLatestMessageIncoming ? 1 : 0;
  // Never show unread badge for messages sent by the current user.
  const unread = isLatestMessageIncoming
    ? (hasDenormalizedUnread && Number.isFinite(denormalizedUnread) && denormalizedUnread >= 0
        ? denormalizedUnread
        : fallbackUnread)
    : 0;
  const title = chat.displayTitle || chat.name || "Untitled chat";
  const preview =
    chat.previewText ||
    chat.lastMessageText ||
    chat.lastMessagePreview ||
    chat.latestMessageText ||
    chat.lastMessage?.text ||
    "No messages yet";
  const isImported = Boolean(chat?.isImported || chat?.type === "imported");

  return (
    <Button
      type="button"
      variant="ghost"
      className={`group glass-panel h-auto w-full justify-start rounded-[1.35rem] px-3 py-3 text-left text-[var(--text-main)] transition-all duration-200 ${isActive ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border-soft)_55%)] bg-[linear-gradient(130deg,color-mix(in_srgb,var(--accent)_18%,var(--panel)_82%),color-mix(in_srgb,var(--accent)_10%,var(--panel)_90%))]" : "hover:border-[color-mix(in_srgb,var(--accent)_25%,var(--border-soft)_75%)] hover:bg-[var(--panel-soft)]"} ${isImported ? "border-[color-mix(in_srgb,#06b6d4_35%,var(--border-soft)_65%)] bg-[linear-gradient(130deg,color-mix(in_srgb,#06b6d4_16%,var(--panel)_84%),color-mix(in_srgb,#0e7490_10%,var(--panel)_90%))]" : ""} ${unread ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border-soft)_55%)] bg-[linear-gradient(130deg,color-mix(in_srgb,var(--accent)_18%,var(--panel)_82%),color-mix(in_srgb,var(--accent)_10%,var(--panel)_90%))]" : ""}`}
      onClick={onSelect}
    >
      <div className="flex w-full items-start gap-3">
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/70 via-pink-300/50 to-blue-400/60 text-white ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-105 text-lg font-bold shadow-lg">
          {isImported ? <Archive size={18} /> : chat.type === "group" ? <Users size={18} /> : title.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-inherit">{title}</p>
            <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{formatTimestamp(chat.lastMessageAt || chat.updatedAt)}</span>
          </div>
          {isImported ? (
            <span className="mt-1 inline-flex w-fit items-center rounded-full border border-cyan-500/45 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-600 dark:text-cyan-300">
              Imported
            </span>
          ) : null}
          <p className={`mt-1 truncate rounded-md px-1 py-0.5 text-xs ${unread ? "font-semibold text-[var(--accent-strong)]" : "text-[var(--text-muted)]"}`}>{preview}</p>
        </div>
        {unread ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 px-1.5 text-[11px] font-bold text-slate-950 shadow-[0_6px_14px_rgba(16,185,129,0.35)]">
            {unread}
          </span>
        ) : null}
      </div>
    </Button>
  );
}