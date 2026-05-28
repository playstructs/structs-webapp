import {OBJECT_ID_PATTERN, PLANET_NAME_PATTERN} from '../constants/RegexPattern.js';

export class PlanetNameUtil {

  static VOWEL = 'VOWEL';
  static CONSONANT = 'CONSONANT';

  static VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];
  static CONSONANTS = [
    'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z',
  ];

  static STARTING_CONSONANT_BIGRAMS = [
    'br', 'ch', 'cl', 'cr', 'fr', 'gr', 'kn', 'll', 'ly', 'pl', 'pr', 'st', 'th', 'tr', 'ts', 'wh',
  ];
  static ENDING_CONSONANT_BIGRAMS = [
    'ch', 'ck', 'ct', 'ld', 'll', 'ly', 'nc', 'nd', 'ng', 'ns', 'nt', 'rd', 'rs', 'rt', 'ss', 'st', 'th', 'ts', 'wn',
  ];

  static get ALL_CONSONANT_BIGRAMS() {
    return [...this.STARTING_CONSONANT_BIGRAMS, ...this.ENDING_CONSONANT_BIGRAMS];
  }

  static GREEK_LETTERS = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu',
    'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
  ];
  static ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  static COMMON_PREFIXES = ['Nega', 'New', 'Proxima'];
  static COMMON_SUFFIXES = ['Major', 'Minor', 'Prime'];

  static PUNCTUATION_MARK_PROB = 0.25;
  static COMMON_PREFIX_PROB = 0.0625;
  static COMMON_SUFFIX_PROB = 0.0625;
  static ROMAN_NUMERAL_PROB = 0.125;
  static GREEK_LETTER_PROB = 0.25;

  /**
   * @param {unknown[]} arr
   * @return {unknown}
   */
  static pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Client-side pre-validation aligned with structsd ValidatePlanetName.
   * @param {string} name
   * @return {boolean}
   */
  static isValidPlanetName(name) {
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
  }

  /**
   * @param {string} name
   * @param {string[]} bannedWords
   * @return {boolean}
   */
  static isBanned(name, bannedWords) {
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
  }

  /**
   * @param {number} [targetBaseNameLength=5]
   * @param {string[]} [bannedWords=[]]
   * @return {string}
   */
  static generate(targetBaseNameLength = 5, bannedWords = []) {
    let name = '';

    while (true) {
      let lengthRemaining = targetBaseNameLength;
      let lastLetterType = '';
      name = '';

      while (lengthRemaining > 0) {
        const possibleNgrams = [];

        if (lengthRemaining === targetBaseNameLength || lastLetterType === this.CONSONANT) {
          possibleNgrams.push(this.pick(this.VOWELS));
        }

        if (lengthRemaining === targetBaseNameLength || lastLetterType === this.VOWEL) {
          possibleNgrams.push(this.pick(this.CONSONANTS));
        }

        if (lengthRemaining > 2 && lengthRemaining === targetBaseNameLength) {
          possibleNgrams.push(this.pick(this.STARTING_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining > 2 && lengthRemaining !== targetBaseNameLength && lastLetterType === this.VOWEL) {
          possibleNgrams.push(this.pick(this.ALL_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining === 2 && lastLetterType === this.VOWEL) {
          possibleNgrams.push(this.pick(this.ALL_CONSONANT_BIGRAMS));
        }

        if (lengthRemaining > 1 && (lengthRemaining === targetBaseNameLength || lastLetterType === this.CONSONANT)) {
          possibleNgrams.push(this.pick(this.VOWELS.slice(0, -1)) + this.pick(this.CONSONANTS));
        }

        if (lengthRemaining > 1 && (lengthRemaining === targetBaseNameLength || lastLetterType === this.VOWEL)) {
          possibleNgrams.push(this.pick(this.CONSONANTS) + this.pick(this.VOWELS));
        }

        if (possibleNgrams.length > 0) {
          const selectedNgram = this.pick(possibleNgrams);
          name += selectedNgram;

          if (targetBaseNameLength === lengthRemaining) {
            name = name.charAt(0).toUpperCase() + name.slice(1);
          }

          const lastChar = name.charAt(name.length - 1).toLowerCase();
          lastLetterType = this.VOWELS.includes(lastChar) ? this.VOWEL : this.CONSONANT;

          lengthRemaining = targetBaseNameLength - name.length;
        }
      }

      if (targetBaseNameLength >= 5 && Math.random() < this.PUNCTUATION_MARK_PROB) {
        if (Math.random() < 0.5) {
          const insertPos = 1 + Math.floor(Math.random() * 2);
          name = name.slice(0, insertPos) + '\'' + name.slice(insertPos);
        } else {
          const hyphenRange = Math.max(1, Math.floor(name.length / 2 - 1));
          const insertPos = 2 + Math.floor(Math.random() * hyphenRange);
          name = name.slice(0, insertPos) + '-' + name.slice(insertPos);
        }
      }

      if (Math.random() < this.COMMON_PREFIX_PROB) {
        name = `${this.pick(this.COMMON_PREFIXES)} ${name}`;
      }
      if (Math.random() < this.GREEK_LETTER_PROB) {
        name = `${name} ${this.pick(this.GREEK_LETTERS)}`;
      }
      if (Math.random() < this.COMMON_SUFFIX_PROB) {
        name = `${name} ${this.pick(this.COMMON_SUFFIXES)}`;
      }
      if (Math.random() < this.ROMAN_NUMERAL_PROB) {
        name = `${name} ${this.pick(this.ROMAN_NUMERALS)}`;
      }

      if (!this.isBanned(name, bannedWords) && this.isValidPlanetName(name)) {
        return name;
      }
    }
  }
}
