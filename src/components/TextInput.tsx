"use client";

import { type ChangeEvent, useRef } from "react";
import { FileText, Upload, Repeat2, Timer } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SourceTextGroup } from "@/lib/parser";

type TextInputProps = {
  text: string;
  onTextChange: (value: string) => void;
  displayText: string;
  sourceGroups: SourceTextGroup[];
  activeGroupKey: string;
  activeVariantIndex: number;
  onSelectGroup: (key: string) => void;
  paragraphWords: number;
  onParagraphWordsChange: (value: number) => void;
  sessionSeconds: number;
  onSessionSecondsChange: (value: number) => void;
  timedSessionEnabled: boolean;
  onTimedSessionEnabledChange: (value: boolean) => void;
};

const paragraphPresets = [15, 30, 45, 60, 90, 120];
const sessionPresets = [15, 30, 45, 60, 90, 120];

export function TextInput({
  text,
  onTextChange,
  displayText,
  sourceGroups,
  activeGroupKey,
  activeVariantIndex,
  onSelectGroup,
  paragraphWords,
  onParagraphWordsChange,
  sessionSeconds,
  onSessionSecondsChange,
  timedSessionEnabled,
  onTimedSessionEnabledChange,
}: TextInputProps) {
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loaded = await file.text();
    onTextChange(loaded);
    event.target.value = "";
  };

  return (
    <section className="space-y-4 rounded-xl border border-border/70 bg-surface/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-wide">Source Text</h3>
          <p className="max-w-md text-xs text-muted-foreground">
            Pick a category, click it again to rotate its variants, or paste your own text.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => uploadRef.current?.click()}
          aria-label="Upload text file"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <input
          ref={uploadRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {sourceGroups.map((group) => {
          const isActive = group.key === activeGroupKey;
          const variantCount = group.variants.length;
          const activeVariant = isActive ? group.variants[activeVariantIndex % Math.max(variantCount, 1)] : group.variants[0];

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onSelectGroup(group.key)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border/70 bg-background/70 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{group.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed opacity-80">{group.description}</p>
                </div>
                <span className="rounded-full border border-border/70 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] opacity-80">
                  {group.variants.length}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed opacity-80">
                {activeVariant?.label} · click again to rotate
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
        <Repeat2 className="h-4 w-4" />
        <span>
          Active pack: <span className="text-foreground">{sourceGroups.find((group) => group.key === activeGroupKey)?.title ?? "Custom"}</span>
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground/70">Paragraph preview (read-only):</p>
        <ScrollArea className="h-48 rounded-md border border-border/60 bg-background/70 p-3">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {displayText || "Text will appear here..."}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground/70">Edit source text:</p>
        <ScrollArea className="h-40 rounded-md border border-border/60 bg-background/70 p-2">
          <Textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            className="min-h-[140px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            aria-label="Reader source text"
            placeholder="Paste a passage to begin reading..."
          />
        </ScrollArea>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <FileText className="h-4 w-4" />
            Paragraph length
          </div>
          <div className="flex flex-wrap gap-2">
            {paragraphPresets.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={paragraphWords === value ? "accent" : "outline"}
                onClick={() => onParagraphWordsChange(value)}
              >
                {value} words
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <Timer className="h-4 w-4" />
            Timed session
          </div>
          <div className="flex flex-wrap gap-2">
            {sessionPresets.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={sessionSeconds === value && timedSessionEnabled ? "accent" : "outline"}
                onClick={() => {
                  if (sessionSeconds === value && timedSessionEnabled) {
                    onTimedSessionEnabledChange(false);
                  } else {
                    onSessionSecondsChange(value);
                    onTimedSessionEnabledChange(true);
                  }
                }}
              >
                {value < 60 ? `${value}s` : `${value / 60}m`}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">When enabled, the text loops until the selected time finishes.</p>
        </div>
      </div>
    </section>
  );
}
