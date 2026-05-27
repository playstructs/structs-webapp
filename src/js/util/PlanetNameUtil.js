import {OBJECT_ID_PATTERN, PLANET_NAME_PATTERN} from '../constants/RegexPattern.js';

const VOWEL = 'VOWEL';
const CONSONANT = 'CONSONANT';

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];
const CONSONANTS = [
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z',
];

const STARTING_CONSONANT_BIGRAMS = [
  'br', 'ch', 'cl', 'cr', 'fr', 'gr', 'kn', 'll', 'ly', 'pl', 'pr', 'st', 'th', 'tr', 'ts', 'wh',
];
const ENDING_CONSONANT_BIGRAMS = [
  'ch', 'ck', 'ct', 'ld', 'll', 'ly', 'nc', 'nd', 'ng', 'ns', 'nt', 'rd', 'rs', 'rt', 'ss', 'st', 'th', 'ts', 'wn',
];
const ALL_CONSONANT_BIGRAMS = [...STARTING_CONSONANT_BIGRAMS, ...ENDING_CONSONANT_BIGRAMS];

const GREEK_LETTERS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu',
  'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
];
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const COMMON_PREFIXES = ['Nega', 'New', 'Proxima'];
const COMMON_SUFFIXES = ['Major', 'Minor', 'Prime'];

const PUNCTUATION_MARK_PROB = 0.25;
const COMMON_PREFIX_PROB = 0.0625;
const COMMON_SUFFIX_PROB = 0.0625;
const ROMAN_NUMERAL_PROB = 0.125;
const GREEK_LETTER_PROB = 0.25;

/**
 * @param {unknown[]} arr
 * @return {unknown}
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Client-side pre-validation aligned with structsd ValidatePlanetName.
 * @param {string} name
 * @return {boolean}
 */
export const isValidPlanetName = (name) => {
  if (!PLANET_NAME_PATTERN.test(name)) {
    return false;
  }
  if (OBJECT_ID_PATTERN.test(name)) {
    return false;
  }
  if (name.startsWith(' ') || name.endsWith(' ')) {
    return false;
  }
  if (name.includes('  ')) {
    return false;
  }
  return true;
};

/**
 * @param {string} name
 * @param {string[]} bannedWords
 * @return {boolean}
 */
const isBanned = (name, bannedWords) => {
  const nameLower = name.toLowerCase();
  const stripped = nameLower.replace(/[^a-zA-Z]/g, '');

  return bannedWords.some((word) => {
    const banned = word.toLowerCase();

    if (nameLower.includes(banned)) {
      return true;
    }
    if (stripped.includes(banned)) {
      return true;
    }

    for (const part of nameLower.split(' ')) {
      if (part.includes(banned)) {
        return true;
      }
      if (part.replace(/[^a-zA-Z]/g, '').includes(banned)) {
        return true;
      }
    }
    for (const part of nameLower.split('-')) {
      if (part.includes(banned)) {
        return true;
      }
      if (part.replace(/[^a-zA-Z]/g, '').includes(banned)) {
        return true;
      }
    }

    return false;
  });
};

export class PlanetNameUtil {

  /**
   * @param {number} [targetBaseNameLength=5]
   * @param {string[]} [bannedWords=[]]
   * @return {string}
   */
  generate(targetBaseNameLength = 5, bannedWords = []) {
    let name = '';

    while (true) {
      let lengthRemaining = targetBaseNameLength;
      let lastLetterType = '';
      name = '';

      while (lengthRemaining > 0) {
        const possibleNgrams = [];

        if (lengthRemaining === targetBaseNameLength || lastLetterType === CONSONANT) {
          possibleNgrams.push(pick(VOWELS));
        }

        if (lengthRemaining === targetBaseNameLength || lastLetterType === VOWEL) {
          possibleNgrams.push(pick(CONSONANTS));
        }

        if (lengthRemaining > 2 && lengthRemaining === targetBaseNameLength) {
          possibleNgrams.push(pick(STARTING_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining > 2 && lengthRemaining !== targetBaseNameLength && lastLetterType === VOWEL) {
          possibleNgrams.push(pick(ALL_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining === 2 && lastLetterType === VOWEL) {
          possibleNgrams.push(pick(ALL_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining > 1 && (lengthRemaining === targetBaseNameLength || lastLetterType === CONSONANT)) {
          possibleNgrams.push(pick(VOWELS.slice(0, -1)) + pick(CONSONANTS));
        }

        if (lengthRemaining > 1 && (lengthRemaining === targetBaseNameLength || lastLetterType === VOWEL)) {
          possibleNgrams.push(pick(CONSONANTS) + pick(VOWELS));
        }

        if (possibleNgrams.length > 0) {
          const selectedNgram = pick(possibleNgrams);
          name += selectedNgram;

          if (targetBaseNameLength === lengthRemaining) {
            name = name.charAt(0).toUpperCase() + name.slice(1);
          }

          const lastChar = name.charAt(name.length - 1).toLowerCase();
          lastLetterType = VOWELS.includes(lastChar) ? VOWEL : CONSONANT;

          lengthRemaining = targetBaseNameLength - name.length;
        }
      }

      if (targetBaseNameLength >= 5 && Math.random() < PUNCTUATION_MARK_PROB) {
        if (Math.random() < 0.5) {
          const insertPos = 1 + Math.floor(Math.random() * 2);
          name = name.slice(0, insertPos) + '\'' + name.slice(insertPos);
        } else {
          const hyphenRange = Math.max(1, Math.floor(name.length / 2 - 1));
          const insertPos = 2 + Math.floor(Math.random() * hyphenRange);
          name = name.slice(0, insertPos) + '-' + name.slice(insertPos);
        }
      }

      if (Math.random() < COMMON_PREFIX_PROB) {
        name = `${pick(COMMON_PREFIXES)} ${name}`;
      }
      if (Math.random() < GREEK_LETTER_PROB) {
        name = `${name} ${pick(GREEK_LETTERS)}`;
      }
      if (Math.random() < COMMON_SUFFIX_PROB) {
        name = `${name} ${pick(COMMON_SUFFIXES)}`;
      }
      if (Math.random() < ROMAN_NUMERAL_PROB) {
        name = `${name} ${pick(ROMAN_NUMERALS)}`;
      }

      if (!isBanned(name, bannedWords) && isValidPlanetName(name)) {
        return name;
      }
    }
  }
}
