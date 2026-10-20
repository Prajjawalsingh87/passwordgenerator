import { WORDS } from "./wordlist.js";

export const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*-_+=[]{}~`",
};

const AMBIGUOUS = /[Il1O0o]/g;

// Unbiased random integer in [0, max) using the Web Crypto API (rejection sampling).
export const randomIndex = (max) => {
  if (!Number.isInteger(max) || max < 1) throw new RangeError("max must be a positive integer");
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
};

export const getCharsets = (options, excludeAmbiguous) =>
  Object.keys(CHARSETS)
    .filter((k) => options[k])
    .map((k) => (excludeAmbiguous ? CHARSETS[k].replace(AMBIGUOUS, "") : CHARSETS[k]));

export function generatePassword(length, options, excludeAmbiguous) {
  const sets = getCharsets(options, excludeAmbiguous);
  if (!sets.length) return "";
  const pool = sets.join("");

  // Guarantee at least one character from every selected set, then shuffle.
  const chars = sets.map((set) => set[randomIndex(set.length)]);
  while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// Entropy estimate for a random password: length × log2(pool size).
export const passwordEntropy = (length, poolSize) =>
  poolSize > 1 ? length * Math.log2(poolSize) : 0;

export const SEPARATORS = [
  { value: "-", label: "Hyphen ( - )" },
  { value: " ", label: "Space" },
  { value: ".", label: "Dot ( . )" },
  { value: "_", label: "Underscore ( _ )" },
  { value: "", label: "None" },
];

export function generatePassphrase({ words = 5, separator = "-", capitalize = false, addNumber = false } = {}, list = WORDS) {
  const picked = Array.from({ length: words }, () => list[randomIndex(list.length)]);
  const out = capitalize ? picked.map((w) => w[0].toUpperCase() + w.slice(1)) : picked;
  if (addNumber && out.length) {
    const i = randomIndex(out.length);
    out[i] = out[i] + randomIndex(10);
  }
  return out.join(separator);
}

// Each word is chosen uniformly from the list; the optional digit (0–9) is
// placed on a random word, adding log2(10 × words) bits. Capitalising every
// word is predictable, so it adds nothing.
export const passphraseEntropy = (words, addNumber, listSize = WORDS.length) =>
  words * Math.log2(listSize) + (addNumber && words > 0 ? Math.log2(10 * words) : 0);

export const strengthFromBits = (bits) => {
  if (bits < 50) return 0;
  if (bits < 70) return 1;
  if (bits < 100) return 2;
  return 3;
};

export const WORD_COUNT = WORDS.length;
