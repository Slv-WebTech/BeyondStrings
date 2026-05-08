import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { BRAND, BRAND_ASSETS } from "../config/branding";

export default function Layout({ sidebar, children, sidebarOpen, onSidebarOpenChange, title, rightAction, showAdmin, hideHeader = false }) {
  return (
    <div className="relative flex h-[100svh] min-h-[100svh] max-w-full overflow-hidden text-[var(--text-main)]">
      <aside className="hidden h-full w-80 shrink-0 overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--panel)] p-3 backdrop-blur-xl lg:flex lg:flex-col lg:p-4">{sidebar}</aside>

      <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
        <SheetContent
          side="left"
          className="z-[140] flex h-full w-[75vw] max-w-[380px] flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-[color:color-mix(in_srgb,var(--panel-strong)_92%,black_8%)] p-3 text-[var(--text-main)] backdrop-blur-2xl sm:p-4 lg:hidden"
        >
          {sidebar}
        </SheetContent>
      </Sheet>

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {!hideHeader ? (
          <header className="relative z-[40] flex items-center justify-between gap-1.5 border-b border-[var(--border-soft)] bg-[var(--panel-strong)] px-2 py-1.5 backdrop-blur-xl md:gap-2 md:px-6 md:py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => onSidebarOpenChange(true)}>
                <Menu size={16} />
              </Button>
              <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                <img src={BRAND_ASSETS.iconDark} alt={BRAND.name} className="h-7 w-7 rounded-md object-contain md:h-8 md:w-8" />
                <div className="min-w-0">
                  <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500/90 [data-theme='dark']_&:text-emerald-300/80 sm:block" style={{ color: 'var(--accent)' }}>{BRAND.name}</p>
                  <h1 className="truncate text-[13px] font-semibold tracking-tight text-[var(--text-main)] md:text-lg">{title}</h1>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-1 md:gap-2">
              {showAdmin ? (
                <span
                  className="hidden items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 [data-theme='dark']_&:text-emerald-200 sm:inline-flex"
                  style={{ color: 'color-mix(in srgb, var(--accent) 90%, currentColor 10%)' }}
                  title="Admin access enabled"
                  aria-label="Admin access enabled"
                >
                  <ShieldCheck size={13} />
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400/65" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                </span>
              ) : null}
              {rightAction}
            </div>
          </header>
        ) : null}

        <div className="relative z-0 min-h-0 flex-1 flex flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
