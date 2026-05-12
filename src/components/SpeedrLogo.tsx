type SpeedrLogoProps = {
  className?: string;
  compact?: boolean;
};

export function SpeedrLogo({ className, compact = false }: SpeedrLogoProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 220 86"
        className={compact ? "h-8 w-auto" : "h-10 w-auto sm:h-11"}
        fill="none"
        role="img"
      >
        <g transform="translate(0 2)">
          <path
            d="M66 28h30"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M52 42h44"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M62 56h26"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M118 20h26c10 0 18 8 18 18s-8 18-18 18h-18c-3 0-6 3-6 6s3 6 6 6h30"
            stroke="var(--foreground)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M148 68h-32c-10 0-18-8-18-18s8-18 18-18h19c3 0 6-3 6-6s-3-6-6-6h-25"
            stroke="var(--foreground)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
