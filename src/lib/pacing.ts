const QUICK_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "and",
  "or",
  "for",
  "is",
  "it",
  "be",
  "by",
  "as",
  "at",
  "we",
  "he",
  "she",
  "they",
  "you",
  "i",
]);

export function calculateWordDelay(word: string, baseWPM: number) {
  const safeWPM = Math.max(80, Math.min(1200, baseWPM));
  const baseDelay = 60000 / safeWPM;
  const text = word.trim();

  if (!text) {
    return baseDelay * 1.2;
  }

  if (/\n{2,}/.test(text) || text === "<PARA_BREAK>") {
    return baseDelay * 2.3;
  }

  let factor = 1;
  const alphaWord = text.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();

  if (/[,:]$/.test(text)) factor += 0.24;
  if (/[;]$/.test(text)) factor += 0.35;
  if (/[.!?]$/.test(text)) factor += 0.58;
  if (/[”"'\)\]]$/.test(text)) factor += 0.05;

  if (alphaWord.length >= 10) factor += 0.16;
  if (alphaWord.length >= 14) factor += 0.16;

  if (alphaWord.length <= 2) factor -= 0.08;
  if (alphaWord.length <= 4 && QUICK_WORDS.has(alphaWord)) factor -= 0.12;

  const variableDelay = baseDelay * factor;
  return Math.max(baseDelay * 0.55, Math.min(baseDelay * 3.2, variableDelay));
}
