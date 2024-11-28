const SEARCH_SYMBOLS_REGEX = /(%s)|(%i(?:\.\d{1,2})?)|(%f(?:\.\d)?)/;
const FORMAT_SYMBOLS_REGEX = new RegExp(SEARCH_SYMBOLS_REGEX, 'g');

/**
 * Format integer digit
 * @param value
 * @param represent
 * @returns {string}
 */
function parseFormatInteger(value: string, represent: string): string {
  let parsed;
  if (value.startsWith('0b')) {
    parsed = parseInt(value.replace('0b', ''), 2);
  } else if (value.startsWith('0o')) {
    parsed = parseInt(value.replace('0o', ''), 8);
  } else if (value.startsWith('0x')) {
    parsed = parseInt(value.replace('0x', ''), 16);
  } else {
    parsed = parseInt(value, 10);
  }
  const [, amount] = represent.split('.');
  const radix = amount && parseInt(amount) || 10;

  if (radix === 16) {
    return '0x' + parsed.toString(16).toUpperCase();
  } else if (radix === 8) {
    return '0o' + parsed.toString(8);
  } else if (radix === 2) {
    return '0b' + parsed.toString(2);
  } else {
    return parsed.toString(radix);
  }
}

/**
 * Format float digit
 * @param value
 * @param represent
 * @returns {string}
 */
function parseFormatFloat(value: string, represent: string): string {
  const [, amount] = represent.split('.');
  let decimals = undefined;
  if (amount) {
    decimals = parseInt(amount, 10);
  }
  const parsed = parseFloat(value);
  if (decimals == null) {
    return parsed.toString();
  } else {
    return parseFloat(parsed.toFixed(decimals)).toString();
  }
}

/**
 * Is contains interpolate chars: %s %f %i
 *
 * @param value
 */
export function isInterpolatable(value: string): boolean {
  return SEARCH_SYMBOLS_REGEX.test(value);
}

/**
 * Interpolate string
 *
 * @param value
 * @param args
 */
export function interpolate(value: string, ...args: any[]): string {
  const toReplace = value.match(FORMAT_SYMBOLS_REGEX);
  if (!toReplace) {
    throw new Error('INVALID');
  }
  let position = 0;

  for (let i = 0; i < toReplace.length; i++) {
    const symbol = toReplace[i];
    let result = '';
    if (symbol === '%s') {
      result = `${args[i]}`
    } else if (symbol.startsWith('%i')) {
      result = parseFormatInteger(`${args[i]}`, symbol);
    } else if (symbol.startsWith('%f')) {
      result = parseFormatFloat(`${args[i]}`, symbol);
    }

    const index = value.indexOf(symbol, position);
    value = value.slice(0, index) + result + value.slice(index + symbol.length);

    position = index + 1;
  }

  return value;
}