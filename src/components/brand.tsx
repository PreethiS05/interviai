import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-brand-foreground shadow-glow",
        className,
      )}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 3.5C3 3.22386 3.22386 3 3.5 3H12.5C12.7761 3 13 3.22386 13 3.5V5.5C13 5.77614 12.7761 6 12.5 6H8.5V12.5C8.5 12.7761 8.27614 13 8 13H7C6.72386 13 6.5 12.7761 6.5 12.5V6H3.5C3.22386 6 3 5.77614 3 5.5V3.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <BrandMark />
      <span className="text-[15px]">
        Interv<span className="text-brand-gradient">AI</span>
      </span>
    </span>
  );
}
