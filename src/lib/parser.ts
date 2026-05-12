export type ParsedToken = {
  id: string;
  text: string;
  isParagraphBreak: boolean;
};

export type SourceTextVariant = {
  label: string;
  text: string;
};

export type SourceTextGroup = {
  key: string;
  title: string;
  description: string;
  variants: SourceTextVariant[];
};

export function parseTextToTokens(text: string): ParsedToken[] {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  const parts = normalized.split(/(\n{2,})/g);
  const tokens: ParsedToken[] = [];
  let index = 0;

  for (const part of parts) {
    if (!part) continue;

    if (/^\n{2,}$/.test(part)) {
      tokens.push({
        id: `token-${index++}`,
        text: "<PARA_BREAK>",
        isParagraphBreak: true,
      });
      continue;
    }

    const words = part.split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push({
        id: `token-${index++}`,
        text: word,
        isParagraphBreak: false,
      });
    }
  }

  return tokens;
}

export function reflowTextIntoParagraphs(text: string, wordsPerParagraph: number) {
  const normalized = text.replace(/\r\n?/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const chunkSize = Math.max(1, wordsPerParagraph);
  const words = normalized.split(" ");
  const paragraphs: string[] = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    paragraphs.push(words.slice(index, index + chunkSize).join(" "));
  }

  return paragraphs.join("\n\n");
}

export const SOURCE_TEXT_GROUPS: SourceTextGroup[] = [
  {
    key: "literature",
    title: "Literature",
    description: "Introspective passages with clean cadence.",
    variants: [
      {
        label: "Holmes",
        text: `To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. He remains a figure of precise habit and extraordinary observation: details that others overlook are for him the pathways into motive and meaning. On a late afternoon the city seemed to supply his reasoning with an abundance of quiet evidence, each street and window a small possibility to be considered.`,
      },
      {
        label: "Train",
        text: `By the time the train crossed the river, evening had folded the city into copper light. Mara kept reading the same sentence, not because it was difficult, but because it kept opening like a door she had not noticed before. The carriage murmured with the low patience of people moving between destinations, and small private dramas began and ended in the spaces between stations. She watched faces and windows, letting the cadence of motion rearrange her attention until the sentence no longer read like ink but like an atmosphere.`,
      },
      {
        label: "Library",
        text: `The library was quiet enough for thought to feel audible. She moved between the shelves with the careful confidence of someone who knew that every answer was already waiting, only hidden in a different order. Light pooled on the reading tables and dust motes kept time like patient metronomes; voices, when they occurred, were brief and reverent. Each book she opened altered the shape of the room, and she left with a small handful of pages that would keep her company for days.`,
      },
    ],
  },
  {
    key: "philosophy",
    title: "Philosophy",
    description: "Thoughtful prose with a disciplined rhythm.",
    variants: [
      {
        label: "Examined",
        text: `The unexamined life is not worth living. Yet examination is not an abstract exercise done in isolation; it is a daily discipline of attention. It requires the courage to revisit habits, to ask why a thought returns, and to accept that clarity often emerges through patient repetition rather than sudden insight. To practice examination is to permit oneself a slow, honest conversation with what is actually happening, not with the story one prefers to tell.`,
      },
      {
        label: "Clarity",
        text: `We are shaped by what we repeatedly notice, and by what we permit to pass unquestioned. Clarity begins where vanity ends, and discipline begins where comfort is interrupted. The practice of noticing rewires attention: small, deliberate acts of observation accumulate until a new grammar for choice becomes possible. Eventually decisions feel less like accidents and more like the natural consequence of what one has learned to see.`,
      },
      {
        label: "Attention",
        text: `Attention is the smallest practical form of freedom. To hold a line of thought, to revisit a doubt, and to refuse the easy shortcut are all ways of refusing to live by accident. The discipline of attention is a muscle: it grows when exercised in small, exact repetitions and declines when scattered across trivial demands. Cultivating it changes the scale of one's life, transforming hurried days into sequences of deliberate encounters.`,
      },
    ],
  },
  {
    key: "science",
    title: "Science",
    description: "Crisp explanation with measurable progression.",
    variants: [
      {
        label: "Stars",
        text: `When a star exhausts the hydrogen in its core, gravity and pressure renegotiate their ancient balance. New fusion pathways ignite, temperatures rise, and structure changes from the inside out. Over timescales that dwarf human history, the death of one star seeds the possibility of others, scattering elements that will one day be recomposed into planets and living chemistry. The cosmos is a slow conversation between collapse and creation, and observing it is to be humbled by durations we can only imagine.`,
      },
      {
        label: "Cells",
        text: `A cell is not a static object but a negotiation in motion. Proteins fold, signals arrive, membranes adapt, and the whole system behaves like a city coordinating itself under constant pressure. Each interaction is small, local, and probabilistic, yet together they compose coherent behavior that sustains life. Studying cells teaches a practical humility: complexity is often emergent, and simple rules applied at scale create patterns we could not deduce by inspecting a single part.`,
      },
      {
        label: "Climate",
        text: `What appears steady to the eye may be a sequence of violent adjustments unfolding over decades. Climate systems move through thresholds, feedback loops, and delayed consequences that only become obvious in hindsight. Human decisions now interact with long delays and inertia, so consequences often arrive in places and times far from their causes. Understanding climate is to accept interdependence across scales and to act with a sense of responsibility for systems that will outlast individual lives.`,
      },
    ],
  },
  {
    key: "fiction",
    title: "Fiction",
    description: "Narrative scenes with a more cinematic pace.",
    variants: [
      {
        label: "Rain",
        text: `Outside, rain began with a patience that felt deliberate. The room stayed warm, the window stayed bright, and the silence between them seemed to hold more meaning than either was ready to say aloud. As drops gathered on the glass they wrote a slow script whose meaning changed depending on how closely one looked; at a distance it was just weather, up close it became a pattern with texture and rhythm. She listened to that rhythm until the city outside seemed distant and the interior became a small, private theater.`,
      },
      {
        label: "Platform",
        text: `The announcement echoed once and then vanished into the platform crowd. He watched the doors close, not because he had missed the train, but because he was unsure whether he still wanted to take it. Around him the city moved with a kind of automatic choreography: brief exchanges, hurried goodbyes, the small rituals of departure and arrival. In that moment he felt the possibility of a different choice, one that required leaving a familiar script and stepping into something less certain.`,
      },
      {
        label: "Lantern",
        text: `She lifted the lantern and the alley changed shape around the light. Every shadow rearranged itself into a clue, and every clue seemed to imply a version of the night she had not yet understood. The lantern's pool revealed details that daylight had hidden: the texture of cobblestones, the ads layered on a lamppost, the careful footprint of a passerby. Moving through that softened geometry, she felt both curiosity and a cautious attention that made each step matter.`,
      },
    ],
  },
];

export const SAMPLE_TEXTS = Object.fromEntries(
  SOURCE_TEXT_GROUPS.map((group) => [group.key, { title: group.title, text: group.variants[0]?.text ?? "" }]),
) as Record<string, { title: string; text: string }>;

export function getSourceTextGroup(key: string) {
  return SOURCE_TEXT_GROUPS.find((group) => group.key === key) ?? null;
}
