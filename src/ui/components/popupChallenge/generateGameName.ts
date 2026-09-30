const ADJECTIVES = [
  "rapido",
  "furioso",
  "astuto",
  "veloz",
  "feroz",
  "noble",
  "bravo",
  "listo",
  "audaz",
  "fiero",
];

const NOUNS = [
  "leon",
  "tigre",
  "aguila",
  "lobo",
  "zorro",
  "oso",
  "puma",
  "halcon",
  "jaguar",
  "cobra",
];

export const generateGameName = (): string => {
  const adjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;

  return `${adjective}-${noun}-${number}`;
};
