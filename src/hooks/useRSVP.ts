"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ParsedToken } from "@/lib/parser";
import { calculateWordDelay } from "@/lib/pacing";

type UseRSVPOptions = {
  tokens: ParsedToken[];
  wpm: number;
  loop?: boolean;
};

export function useRSVP({ tokens, wpm, loop = false }: UseRSVPOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setElapsedMs((prev) => prev + 1000);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || tokens.length === 0) return;
    if (currentIndex >= tokens.length) return;

    const activeToken = tokens[currentIndex];

    // Pause at paragraph breaks so user can manually continue
    if (activeToken?.isParagraphBreak) {
      setIsPlaying(false);
      return;
    }

    const delay = calculateWordDelay(activeToken?.text ?? "", wpm);

    tickRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= tokens.length) {
          if (loop && tokens.length > 0) {
            return 0;
          }

          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, delay);

    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
  }, [isPlaying, currentIndex, tokens, wpm, loop]);

  const totalWords = useMemo(
    () => tokens.filter((token) => !token.isParagraphBreak).length,
    [tokens],
  );

  const wordsCompleted = useMemo(
    () =>
      tokens
        .slice(0, currentIndex)
        .filter((token) => !token.isParagraphBreak).length,
    [tokens, currentIndex],
  );

  const currentToken = tokens[currentIndex] ?? null;

  // Calculate progress per paragraph (0-1 for current paragraph)
  const progress = useMemo(() => {
    // Find paragraph boundaries
    let paragraphStart = 0;
    let paragraphEnd = tokens.length;

    // Find start of current paragraph (last break before currentIndex)
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (tokens[i]?.isParagraphBreak) {
        paragraphStart = i + 1;
        break;
      }
    }

    // Find end of current paragraph (first break after currentIndex)
    for (let i = currentIndex; i < tokens.length; i++) {
      if (tokens[i]?.isParagraphBreak) {
        paragraphEnd = i;
        break;
      }
    }

    // Count words in current paragraph
    const wordsInParagraph = tokens
      .slice(paragraphStart, paragraphEnd)
      .filter((token) => !token.isParagraphBreak).length;

    // Count words completed in current paragraph
    const wordsCompletedInParagraph = tokens
      .slice(paragraphStart, Math.min(currentIndex, paragraphEnd))
      .filter((token) => !token.isParagraphBreak).length;

    return wordsInParagraph > 0 ? wordsCompletedInParagraph / wordsInParagraph : 0;
  }, [tokens, currentIndex]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setElapsedMs(0);
    startedAtRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (tokens.length === 0) return;
    if (!startedAtRef.current) startedAtRef.current = Date.now();
    setIsPlaying(true);
  }, [tokens.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying((prev) => (tokens.length === 0 ? false : !prev));
  }, [tokens.length]);

  return {
    currentIndex,
    currentToken,
    isPlaying,
    elapsedMs,
    totalWords,
    wordsCompleted,
    progress,
    setCurrentIndex,
    setIsPlaying,
    play,
    pause,
    toggle,
    restart,
  };
}
