export const CAMEL_CASE = 'CAMEL_CASE';
export const KEBAB_CASE = 'KEBAB_CASE';
export const LOWER_SNAKE_CASE = 'LOWER_SNAKE_CASE';
export const UPPER_SNAKE_CASE = 'UPPER_SNAKE_CASE';
export const SPACE_SEPARATED_WORDS = 'SPACE_SEPARATED_WORDS';

export class CaseConverter {

  /**
   * Converts a string into the specified case.
   *
   * @param {string} source the source string which can be space separate words, or in camel case, kebab case, lower snake case, or upper snake case
   * @param {string} targetCase the case to convert the source to
   * @return {string} the source string formatted in the given case
   */
  convert(source, targetCase) {
    const words = this.tokenize(source);

    switch (targetCase) {
      case CAMEL_CASE:
        return words
          .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
          .join('');
      case KEBAB_CASE:
        return words.join('-');
      case LOWER_SNAKE_CASE:
        return words.join('_');
      case UPPER_SNAKE_CASE:
        return words.map(w => w.toUpperCase()).join('_');
      case SPACE_SEPARATED_WORDS:
        return words.join(' ');
      default:
        return source;
    }
  }

  /**
   * @param {string} source
   * @return {string[]}
   */
  tokenize(source) {
    return source
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
}
