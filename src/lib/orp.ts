function getCoreWordParts(word: string) {
  const match = word.match(/^([^\p{L}\p{N}]*)((?:[\p{L}\p{N}]|['-])+)([^\p{L}\p{N}]*)$/u);
  if (!match) {
    return { prefix: "", core: word, suffix: "" };
  }

  return {
    prefix: match[1] ?? "",
    core: match[2] ?? word,
    suffix: match[3] ?? "",
  };
}

function getCoreORPIndex(length: number) {
  if (length <= 1) return 0;
  if (length <= 5) return 1;

  const ratio = length <= 9 ? 0.45 : 0.43;
  return Math.max(1, Math.floor(length * ratio));
}

export function getORPIndex(word: string): number {
  if (!word) return 0;

  const { prefix, core } = getCoreWordParts(word);
  const coreLength = core.length;

  if (coreLength <= 0) {
    return Math.max(0, Math.floor((word.length - 1) / 2));
  }

  const coreIndex = Math.min(coreLength - 1, getCoreORPIndex(coreLength));
  return Math.min(word.length - 1, prefix.length + coreIndex);
}

export function splitWordAtORP(word: string) {
  const index = getORPIndex(word);
  return {
    left: word.slice(0, index),
    orp: word[index] ?? "",
    right: word.slice(index + 1),
    index,
  };
}
