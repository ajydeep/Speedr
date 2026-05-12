"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type ReadingMode = "balanced" | "focus" | "accelerated";

type ControlsProps = {
  className?: string;
  wpm: number;
  fontSize: number;
  accentColor: string;
  readingMode: ReadingMode;
  fontFamily: "mono" | "sans" | "serif";
  showTimer: boolean;
  showProgress: boolean;
  showGuide: boolean;
  focusMode: boolean;
  timedSessionEnabled: boolean;
  sessionSeconds: number;
  darkMode: boolean;
  onWpmChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onAccentColorChange: (value: string) => void;
  onReadingModeChange: (value: ReadingMode) => void;
  onFontFamilyChange: (value: "mono" | "sans" | "serif") => void;
  onShowTimerChange: (value: boolean) => void;
  onShowProgressChange: (value: boolean) => void;
  onShowGuideChange: (value: boolean) => void;
  onFocusModeChange: (value: boolean) => void;
  onTimedSessionEnabledChange: (value: boolean) => void;
  onSessionSecondsChange: (value: number) => void;
  onDarkModeToggle: () => void;
  elapsedLabel: string;
  wordsCompleted: number;
  totalWords: number;
  estimatedLabel: string;
};

export function Controls({
  className,
  wpm,
  fontSize,
  accentColor,
  readingMode,
  fontFamily,
  showTimer,
  showProgress,
  showGuide,
  focusMode,
  timedSessionEnabled,
  sessionSeconds,
  darkMode,
  onWpmChange,
  onFontSizeChange,
  onAccentColorChange,
  onReadingModeChange,
  onFontFamilyChange,
  onShowTimerChange,
  onShowProgressChange,
  onShowGuideChange,
  onFocusModeChange,
  onTimedSessionEnabledChange,
  onSessionSecondsChange,
  onDarkModeToggle,
  elapsedLabel,
  wordsCompleted,
  totalWords,
  estimatedLabel,
}: ControlsProps) {
  return (
    <aside className={`flex h-full w-full flex-col gap-4 bg-surface/50 p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Session Controls</h3>
        <Button variant="ghost" size="icon" onClick={onDarkModeToggle} aria-label="Toggle color theme">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4 text-sm">
        <label className="space-y-2">
          <div className="flex items-center justify-between">
            <span>WPM</span>
            <span className="text-muted-foreground">{wpm}</span>
          </div>
          <Slider value={[wpm]} min={120} max={900} step={10} onValueChange={(v) => onWpmChange(v[0] ?? wpm)} />
        </label>

        <label className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Font Size</span>
            <span className="text-muted-foreground">{fontSize}px</span>
          </div>
          <Slider value={[fontSize]} min={48} max={144} step={2} onValueChange={(v) => onFontSizeChange(v[0] ?? fontSize)} />
        </label>

        <label className="space-y-2">
          <span>Reading Mode</span>
          <Select value={readingMode} onValueChange={(v: ReadingMode) => onReadingModeChange(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="focus">Focus</SelectItem>
              <SelectItem value="accelerated">Accelerated</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2">
          <span>Font Family</span>
          <Select value={fontFamily} onValueChange={(v: "mono" | "sans" | "serif") => onFontFamilyChange(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mono">Mono alignment</SelectItem>
              <SelectItem value="sans">Humanist sans</SelectItem>
              <SelectItem value="serif">Editorial serif</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2">
          <span>Accent Color</span>
          <div className="flex items-center gap-2">
            {[
              "#d97706",
              "#c2410c",
              "#b45309",
              "#0f766e",
              "#1d4ed8",
              "#7c3aed",
              "#db2777",
              "#16a34a",
              "#ea580c",
            ].map((color) => (
              <button
                key={color}
                type="button"
                className="h-6 w-6 rounded-full border border-border"
                style={{ backgroundColor: color }}
                aria-label={`Set accent ${color}`}
                onClick={() => onAccentColorChange(color)}
              />
            ))}
            <span className="ml-auto rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground">
              {accentColor}
            </span>
          </div>
        </label>
      </div>

      <Separator />

      <div className="space-y-3 text-sm">
        <ToggleRow label="Show timer" value={showTimer} onCheckedChange={onShowTimerChange} />
        <ToggleRow label="Show progress" value={showProgress} onCheckedChange={onShowProgressChange} />
        <ToggleRow label="Focus guide line" value={showGuide} onCheckedChange={onShowGuideChange} />
        <ToggleRow label="Focus mode" value={focusMode} onCheckedChange={onFocusModeChange} />
        <ToggleRow label="Timed session" value={timedSessionEnabled} onCheckedChange={onTimedSessionEnabledChange} />

        {timedSessionEnabled && (
          <label className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Session time</span>
              <span className="text-muted-foreground">{sessionSeconds < 60 ? `${sessionSeconds}s` : `${sessionSeconds / 60}m`}</span>
            </div>
            <Slider
              value={[sessionSeconds]}
              min={15}
              max={120}
              step={15}
              onValueChange={(v) => onSessionSecondsChange(v[0] ?? sessionSeconds)}
            />
            <p className="text-xs text-muted-foreground">The text will loop until the timer ends.</p>
          </label>
        )}
      </div>

      <Separator />

      <dl className="space-y-2 text-sm">
        <StatRow label="Elapsed" value={elapsedLabel} />
        <StatRow label="Estimated" value={estimatedLabel} />
        <StatRow label="Words" value={`${wordsCompleted}/${Math.max(totalWords, 1)}`} />
      </dl>
    </aside>
  );
}

function ToggleRow({
  label,
  value,
  onCheckedChange,
}: {
  label: string;
  value: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <Switch checked={value} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
