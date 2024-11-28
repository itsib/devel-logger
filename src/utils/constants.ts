
export const LOG_LEVEL_CODE: { [level: string]: number } = Object.freeze({
  silence: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
});

export const CODE_LOG_LEVEL: { [code: number]: string } = Object.keys(LOG_LEVEL_CODE).reduce((obj, key) => {
  const value = LOG_LEVEL_CODE[key];
  obj[value] = key;
  return obj;
}, {} as { [code: number]: string });

export const CODE_LOG_ICON: { [level: string]: [string, number, number, boolean] } = Object.freeze({
  error: ['🛇', 1, 0, true],
  warn: ['🛆', 3, 0, true],
  debug: ['🛠', 7, 0, true],
  info: ['🛈', 4, 0, true],
})

export const COLOR_NAME_CODE: { [color: string]: number } = Object.freeze({
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
});

export const PRIMITIVES = Object.freeze({
  'string': true,
  'number': true,
  'bigint': true,
  'boolean': true,
  'symbol': true,
});