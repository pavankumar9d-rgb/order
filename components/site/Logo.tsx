import { cn } from "@/lib/utils";
import { brand } from "@/data/site";

/** The mark: a parcel at three-quarter, taped across (viewBox 0 0 32 32). Same geometry as the carton print. */
export function Mark({ className, cut = "var(--color-ivory)", title }: { className?: string; cut?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-auto", className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M7 11.5 16 7l9 4.5v9L16 25l-9-4.5z" fill="currentColor" />
      <path d="M7 11.5 16 16l9-4.5M16 16v9M11.5 9.25 20.5 13.75" fill="none" stroke={cut} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ className, compact = false, cut }: { className?: string; compact?: boolean; cut?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-current", className)}>
      <Mark className={cn(compact ? "h-7" : "h-8", "text-accent")} cut={cut} />
      <span className="flex flex-col leading-none">
        <span className="wide text-[1.2rem]">{brand.wordmark}</span>
        {!compact && <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.22em] opacity-60">{brand.product}</span>}
      </span>
    </span>
  );
}
