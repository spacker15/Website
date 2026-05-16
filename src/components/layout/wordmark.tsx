import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark — to be replaced with the team's official logo.
 * Pairs an Oswald "CREEKS" with crossed-stick SVG and tag line.
 */
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: { text: "text-lg", tag: "text-[10px]", icon: 28 },
    md: { text: "text-2xl", tag: "text-xs", icon: 36 },
    lg: { text: "text-4xl", tag: "text-sm", icon: 56 },
    xl: { text: "text-6xl", tag: "text-base", icon: 96 },
  } as const;
  const s = sizes[size];
  return (
    <span
      className={cn("inline-flex items-center gap-2 select-none", className)}
      aria-label="Creek's Girls Lacrosse"
    >
      <CrossedSticks size={s.icon} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-bold text-brand-teal-700", s.text)}>
          CREEK&apos;S
        </span>
        <span
          className={cn(
            "font-display font-semibold tracking-[0.25em] text-brand-pink-600",
            s.tag,
          )}
        >
          GIRLS LACROSSE
        </span>
      </span>
    </span>
  );
}

function CrossedSticks({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="stickA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00a9b7" />
          <stop offset="100%" stopColor="#007079" />
        </linearGradient>
        <linearGradient id="stickB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b3fa0" />
          <stop offset="100%" stopColor="#41255f" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 32 32)">
        <rect x="30" y="6" width="4" height="52" rx="2" fill="url(#stickA)" />
        <ellipse cx="32" cy="9" rx="7" ry="5" fill="none" stroke="url(#stickA)" strokeWidth="2.5" />
      </g>
      <g transform="rotate(-45 32 32)">
        <rect x="30" y="6" width="4" height="52" rx="2" fill="url(#stickB)" />
        <ellipse cx="32" cy="9" rx="7" ry="5" fill="none" stroke="url(#stickB)" strokeWidth="2.5" />
      </g>
      <circle cx="32" cy="32" r="3.5" fill="#ff4fa3" />
    </svg>
  );
}
