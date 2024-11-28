const ESCAPE_CHARS = '(?:\\u0007|\\u001B\\u005C|\\u009C)';
const STRIP_COLORS_EX = new RegExp([
  `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ESCAPE_CHARS})`,
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
].join('|'), 'g');

export interface MarkupOptions {
  code: number;
  accent?: boolean;
  format?: number;
}

/**
 * Colorize string
 * @param {string} value
 * @param {MarkupOptions} opts
 */
export function markup(value: string | undefined, opts?: MarkupOptions): string {
  const { code, accent = false, format = 0 } = opts || {}
  if (value == null || code == null || code < 0 || code > 7) {
    return value || '';
  }

  let output = '\x1b[';
  output += `${format};`
  output += accent ? '9' : '3';
  output += `${code}m`
  output += value;
  output += '\x1b[0m';
  return output;
}

/**
 * Remove format special chars
 * @param value
 */
export function stripColor(value: string): string {
  if (!value) return value;
  return value.replace(STRIP_COLORS_EX, '');
}


