"use client";

import { splitWordAtORP } from "@/lib/orp";
import { cn } from "@/lib/utils";

type WordDisplayProps = {
  word: string;
  maxORPIndex: number;
  fontSize: number;
  accentColor: string;
  fontClassName: string;
  showGuide: boolean;
};

export function WordDisplay({
  word,
  maxORPIndex,
  fontSize,
  accentColor,
  fontClassName,
  showGuide,
}: WordDisplayProps) {
  const { left, orp, right } = splitWordAtORP(word || " ");
  const isParagraphBreak = word === "<PARA_BREAK>";

  return (
    <div className="relative flex min-h-[42svh] items-center justify-center overflow-hidden px-4">
      {showGuide && (
        <div className="pointer-events-none absolute inset-x-12 top-[46%] h-px -translate-y-1/2 bg-foreground/6" />
      )}

      <div
        key={word}
        className={cn("select-none text-center tabular-nums", fontClassName)}
        style={{ fontSize, lineHeight: 1.02 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {isParagraphBreak ? (
          <span className="text-muted-foreground/70">¶</span>
        ) : (
          <span className="inline-flex items-baseline whitespace-pre">
            <span
              className="inline-block text-right text-foreground"
              style={{ width: `${Math.max(maxORPIndex, 1)}ch` }}
            >
              {left}
            </span>
            <span className="inline-block px-0.5" style={{ color: accentColor }}>
              {orp || " "}
            </span>
            <span className="inline-block text-left text-foreground">{right}</span>
          </span>
        )}
      </div>
    </div>
  );
}
