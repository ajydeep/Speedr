"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";

import { Controls } from "@/components/Controls";
import { TextInput } from "@/components/TextInput";
import { WordDisplay } from "@/components/WordDisplay";
import { Button } from "@/components/ui/button";
import { useRSVP } from "@/hooks/useRSVP";
import { getORPIndex } from "@/lib/orp";
import { getSourceTextGroup, parseTextToTokens, reflowTextIntoParagraphs, SOURCE_TEXT_GROUPS } from "@/lib/parser";

type ReadingMode = "balanced" | "focus" | "accelerated";
type FontChoice = "mono" | "sans" | "serif";

type ReaderSettings = {
  wpm: number;
  fontSize: number;
  fontFamily: FontChoice;
  accentColor: string;
  showTimer: boolean;
  showProgress: boolean;
  showGuide: boolean;
  focusMode: boolean;
  hideControls: boolean;
  readingMode: ReadingMode;
  paragraphWords: number;
  timedSessionEnabled: boolean;
  sessionSeconds: number;
};

const STORAGE_TEXT = "flashread:text";
const STORAGE_SETTINGS = "flashread:settings";
const STORAGE_CONTROLS_WIDTH = "flashread:controls-width";
const MIN_CONTROLS_WIDTH = 280;
const MAX_CONTROLS_WIDTH = 420;
const DEFAULT_CONTROLS_WIDTH = 340;

const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 320,
  fontSize: 62,
  fontFamily: "mono",
  accentColor: "#d97706",
  showTimer: true,
  showProgress: true,
  showGuide: true,
  focusMode: false,
  hideControls: false,
  readingMode: "balanced",
  paragraphWords: 30,
  timedSessionEnabled: false,
  sessionSeconds: 30,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Reader() {
  const reduceMotion = useReducedMotion();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const readerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const [sourceText, setSourceText] = useState(SOURCE_TEXT_GROUPS[0]?.variants[0]?.text ?? "");
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(DEFAULT_SETTINGS.sessionSeconds);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [controlsWidth, setControlsWidth] = useState(DEFAULT_CONTROLS_WIDTH);
  const [sourceGroupKey, setSourceGroupKey] = useState(SOURCE_TEXT_GROUPS[0]?.key ?? "literature");
  const [sourceVariantIndex, setSourceVariantIndex] = useState(0);
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const persistedText = window.localStorage.getItem(STORAGE_TEXT);
    const persistedSettingsRaw = window.localStorage.getItem(STORAGE_SETTINGS);

    const timer = window.setTimeout(() => {
      if (persistedText) {
        setSourceText(persistedText);
      }

      if (persistedSettingsRaw) {
        try {
          const parsed = JSON.parse(persistedSettingsRaw) as Partial<ReaderSettings>;
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettings(merged);
          setCountdownLeft(merged.sessionSeconds);
        } catch {
          // Ignore malformed localStorage payloads.
        }
      }

      const persistedControlsWidth = window.localStorage.getItem(STORAGE_CONTROLS_WIDTH);
      if (persistedControlsWidth) {
        const parsedWidth = Number(persistedControlsWidth);
        if (Number.isFinite(parsedWidth)) {
          setControlsWidth(clamp(parsedWidth, MIN_CONTROLS_WIDTH, MAX_CONTROLS_WIDTH));
        }
      }

      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_TEXT, sourceText);
  }, [sourceText, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  }, [settings, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_CONTROLS_WIDTH, String(controlsWidth));
  }, [controlsWidth, hasHydrated]);

  const speedWithMode = useMemo(() => {
    if (settings.readingMode === "focus") return Math.max(120, settings.wpm - 40);
    if (settings.readingMode === "accelerated") return settings.wpm + 60;
    return settings.wpm;
  }, [settings.readingMode, settings.wpm]);

  const displayText = useMemo(
    () => reflowTextIntoParagraphs(sourceText, settings.paragraphWords),
    [sourceText, settings.paragraphWords],
  );

  const tokens = useMemo(() => parseTextToTokens(displayText), [displayText]);

  const maxORPIndex = useMemo(() => {
    const computed = Math.max(
      2,
      ...tokens.filter((token) => !token.isParagraphBreak).map((token) => getORPIndex(token.text)),
    );

    return Math.min(8, computed);
  }, [tokens]);

  const {
    currentToken,
    isPlaying,
    elapsedMs,
    totalWords,
    wordsCompleted,
    progress,
    setIsPlaying,
    toggle,
    restart,
  } = useRSVP({ tokens, wpm: speedWithMode, loop: settings.timedSessionEnabled });

  useEffect(() => {
    restart();
    setIsPlaying(false);
  }, [tokens, restart, setIsPlaying]);

  useEffect(() => {
    if (!settings.timedSessionEnabled) return;
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setCountdownLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [settings.timedSessionEnabled, isPlaying, setIsPlaying]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTypingTarget = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTypingTarget) return;

      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
        setSettings((prev) => ({ ...prev, wpm: Math.min(900, prev.wpm + 20) }));
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        setSettings((prev) => ({ ...prev, wpm: Math.max(120, prev.wpm - 20) }));
      }
      if (event.code === "Escape") {
        setSettings((prev) => ({ ...prev, focusMode: false }));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  useEffect(() => {
    const listener = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const handleFullscreen = async () => {
    const target = mainRef.current ?? readerRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await target.requestFullscreen();
    }
  };

  const fontClassName =
    settings.fontFamily === "mono"
      ? "font-mono"
      : settings.fontFamily === "serif"
        ? "font-[var(--font-playfair)]"
        : "font-sans";

  const elapsedLabel = formatSeconds(Math.floor(elapsedMs / 1000));
  const estimatedTotalSeconds = Math.ceil((totalWords / Math.max(speedWithMode, 1)) * 60);
  const estimatedLabel = formatSeconds(Math.max(estimatedTotalSeconds - Math.floor(elapsedMs / 1000), 0));
  const sessionLabel = formatSeconds(countdownLeft);

  const showPanels = !settings.focusMode;
  const showControls = !settings.hideControls && showPanels;
  const effectiveTheme = theme === "system" ? resolvedTheme : theme;

  const handleResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: controlsWidth,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;

      const delta = state.startX - moveEvent.clientX;
      const nextWidth = clamp(state.startWidth + delta, MIN_CONTROLS_WIDTH, MAX_CONTROLS_WIDTH);
      setControlsWidth(nextWidth);
    };

    const handlePointerUp = () => {
      resizeStateRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const cycleSourceGroup = (key: string) => {
    const group = getSourceTextGroup(key);
    if (!group) return;

    setSourceGroupKey(key);
    setSourceVariantIndex((prevIndex) => {
      const nextIndex = key === sourceGroupKey ? (prevIndex + 1) % group.variants.length : 0;
      const nextText = group.variants[nextIndex]?.text ?? group.variants[0]?.text ?? "";
      setSourceText(nextText);
      return nextIndex;
    });
  };

  return (
    <section id="reader" ref={readerRef} className="w-full overflow-hidden rounded-2xl border border-border/70 bg-background/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5 sm:px-6">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Space: play/pause · Up/Down: speed
        </div>
        <div className="flex items-center gap-2">
          {!settings.focusMode && (
            <Button variant={showTextInput ? "accent" : "outline"} size="sm" onClick={() => setShowTextInput((prev) => !prev)}>
              {showTextInput ? "Hide Text" : "Source Text"}
            </Button>
          )}
          {!settings.focusMode && (
            <Button
              variant={settings.hideControls ? "accent" : "outline"}
              size="sm"
              onClick={() => setSettings((prev) => ({ ...prev, hideControls: !prev.hideControls }))}
            >
              {settings.hideControls ? "Show Controls" : "Hide Controls"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {showPanels && showTextInput && (
        <div className="border-b border-border/70 p-4 sm:p-5">
          <TextInput
            text={sourceText}
            onTextChange={setSourceText}            displayText={displayText}            sourceGroups={SOURCE_TEXT_GROUPS}
            activeGroupKey={sourceGroupKey}
            activeVariantIndex={sourceVariantIndex}
            onSelectGroup={cycleSourceGroup}
            paragraphWords={settings.paragraphWords}
            onParagraphWordsChange={(value) => setSettings((prev) => ({ ...prev, paragraphWords: value }))}
            sessionSeconds={settings.sessionSeconds}
                onSessionSecondsChange={(value) => {
                  setSettings((prev) => ({ ...prev, sessionSeconds: value, timedSessionEnabled: true }));
                  setCountdownLeft(value);
                }}
                timedSessionEnabled={settings.timedSessionEnabled}
                onTimedSessionEnabledChange={(value) => setSettings((prev) => ({ ...prev, timedSessionEnabled: value }))}
          />
        </div>
      )}

      <div
        className={showPanels ? "reader-split" : "grid min-h-[50svh] grid-cols-1 overflow-hidden"}
        style={{
          ["--controls-width" as string]: `${controlsWidth}px`,
        } as CSSProperties}
      >
        <main
          ref={mainRef}
          className={`${showPanels ? "relative flex min-w-0 flex-col border-b border-border/70 lg:border-b-0 lg:border-r" : "relative flex min-w-0 flex-col"} ${isFullscreen ? "min-h-screen w-full bg-background text-foreground" : "bg-background text-foreground"}`}
          style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`relative flex flex-1 flex-col justify-center pb-3 pt-1 ${isFullscreen ? "min-h-[100svh]" : "min-h-[24svh] sm:min-h-[28svh]"}`}
          >
            {settings.showProgress && (
              <div className="absolute left-0 right-0 top-0 h-1 bg-foreground/10" aria-hidden>
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </div>
            )}

            {(settings.showTimer || settings.timedSessionEnabled) && (
              <div className="absolute right-4 top-4 flex gap-3 text-xs text-muted-foreground sm:right-6">
                {settings.showTimer && <span>Elapsed {elapsedLabel}</span>}
                {settings.timedSessionEnabled && <span>Session {sessionLabel}</span>}
              </div>
            )}

            <WordDisplay
              word={currentToken?.text ?? "Ready"}
              maxORPIndex={maxORPIndex}
              fontSize={settings.fontSize}
              accentColor={settings.accentColor}
              fontClassName={fontClassName}
              showGuide={settings.showGuide}
            />

            {(showPanels || isFullscreen) && (
              <div className={isFullscreen ? "absolute inset-x-0 bottom-6 flex justify-center px-4" : "mx-auto mt-1 flex w-full max-w-2xl justify-center px-4 sm:px-6"}>
                <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-background/85 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <Button size="sm" variant="accent" onClick={toggle}>
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      restart();
                      setIsPlaying(false);
                      setCountdownLeft(settings.sessionSeconds);
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                  {isFullscreen && (
                    <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Exit Fullscreen
                    </Button>
                  )}
                </div>
              </div>
            )}

            {settings.focusMode && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
                <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md">
                  <Button variant="outline" size="sm" onClick={toggle}>
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={restart}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSettings((prev) => ({ ...prev, focusMode: false }))}>
                    Exit Focus
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </main>

        {showPanels && (
          <button
            type="button"
            className="reader-split-handle hidden items-stretch justify-center bg-background/60 transition-colors hover:bg-foreground/5 lg:flex"
            aria-label="Resize controls panel"
            onPointerDown={handleResizePointerDown}
          >
            <span className="my-auto flex h-10 w-5 flex-col items-center justify-center gap-1 rounded-full border border-border/70 bg-background/90 shadow-sm">
              <span className="h-1 w-1 rounded-full bg-border/80" />
              <span className="h-1 w-1 rounded-full bg-border/80" />
              <span className="h-1 w-1 rounded-full bg-border/80" />
            </span>
          </button>
        )}

        {showControls && !settings.focusMode && (
          <Controls
            className="border-t border-border/70 lg:border-t-0 lg:border-l"
            wpm={settings.wpm}
            fontSize={settings.fontSize}
            accentColor={settings.accentColor}
            readingMode={settings.readingMode}
            fontFamily={settings.fontFamily}
            showTimer={settings.showTimer}
            showProgress={settings.showProgress}
            showGuide={settings.showGuide}
            focusMode={settings.focusMode}
            timedSessionEnabled={settings.timedSessionEnabled}
            sessionSeconds={settings.sessionSeconds}
            darkMode={effectiveTheme === "dark"}
            onWpmChange={(value) => setSettings((prev) => ({ ...prev, wpm: value }))}
            onFontSizeChange={(value) => setSettings((prev) => ({ ...prev, fontSize: value }))}
            onAccentColorChange={(value) => setSettings((prev) => ({ ...prev, accentColor: value }))}
            onReadingModeChange={(value) => setSettings((prev) => ({ ...prev, readingMode: value }))}
            onFontFamilyChange={(value) => setSettings((prev) => ({ ...prev, fontFamily: value }))}
            onShowTimerChange={(value) => setSettings((prev) => ({ ...prev, showTimer: value }))}
            onShowProgressChange={(value) => setSettings((prev) => ({ ...prev, showProgress: value }))}
            onShowGuideChange={(value) => setSettings((prev) => ({ ...prev, showGuide: value }))}
            onFocusModeChange={(value) => setSettings((prev) => ({ ...prev, focusMode: value }))}
            onTimedSessionEnabledChange={(value) => setSettings((prev) => ({ ...prev, timedSessionEnabled: value }))}
            onSessionSecondsChange={(value) => {
              setSettings((prev) => ({ ...prev, sessionSeconds: value }));
              setCountdownLeft(value);
            }}
            onDarkModeToggle={() => setTheme(effectiveTheme === "dark" ? "light" : "dark")}
            elapsedLabel={elapsedLabel}
            wordsCompleted={wordsCompleted}
            totalWords={totalWords}
            estimatedLabel={estimatedLabel}
          />
        )}
      </div>
    </section>
  );
}

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
