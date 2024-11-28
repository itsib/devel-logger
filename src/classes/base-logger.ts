import { Config, LogLevel, TimeFormat } from '../types';
import { humanizeFormat, relativeFormat } from '../utils/datetime';
import { CODE_LOG_ICON, CODE_LOG_LEVEL, COLOR_NAME_CODE, LOG_LEVEL_CODE, PRIMITIVES } from '../utils/constants';
import { interpolate, isInterpolatable } from '../utils/interpolate';
import { markup, stripColor, MarkupOptions } from '../utils/format';
import { renderObject, RenderOptions } from '../utils/render-object';

export class BaseLogger {

  protected _level: number;

  private readonly _colorCode?: number;

  private readonly _prefix?: string;

  private readonly _begin: number;

  private readonly _timeFormat: TimeFormat;

  private readonly _isUseIcons: boolean;

  private readonly _override: (level: LogLevel, line: string) => string | false;

  constructor(config: Config = {}) {
    if (config.color && !(config.color in COLOR_NAME_CODE) || config.color === ('red' as any)) {
      throw new Error('INVALID_COLOR');
    }

    this._colorCode = config.color ? COLOR_NAME_CODE[config.color] : undefined;
    this._prefix = config.prefix ? `[${config.prefix}]` : undefined;
    this._begin = Date.now();
    this._timeFormat = config.timeFormat || 'relative';
    this._isUseIcons = config.icons !== false;
    this._override = config.override || ((_, line: string) => line);
    this._level = config.logLevel && config.logLevel in LOG_LEVEL_CODE ? LOG_LEVEL_CODE[config.logLevel] : 3;
  }

  /**
   * Current log level
   */
  get logLevel(): LogLevel {
    return CODE_LOG_LEVEL[this._level] as LogLevel;
  }

  get isColor(): boolean {
    return !!this._colorCode && !process.env.NO_COLOR;
  }

  setLogLevel(level: LogLevel): void {
    this._level = LOG_LEVEL_CODE[level];
  }

  /**
   * Format error
   * @param error
   */
  printError(error: Error | string | any) {
    if (this._level < 1) return;

    let message: string;
    let stack: string[];
    if (error && error instanceof Error) {
      message = error.toString();
      stack = error.stack?.replace(message, '').split('\n') || [];
    } else if (error) {
      message = `${error}`;
      stack = [];
    } else {
      message = 'UnknownError';
      stack = [];
    }

    let nextLines;
    [message, ...nextLines] = message.split('\n')
    stack = [...nextLines, ...stack];
    message = stripColor(message);

    // render error message
    let output = this._addPrefix('');
    output = this._addDatetime(output);
    output = this._addIcon('error', output);
    output = this._addColorizedString(message, output, { code: 1, accent: true, format: 1 });
    this._write(output)

    // render stack trace
    for (let line of stack) {
      line = stripColor(line).trim();
      if (!line) continue;

      line = '     ' + line;

      let lineOutput = this._addPrefix('');
      lineOutput = this._addDatetime(lineOutput);
      lineOutput = this._addColorizedString(line, lineOutput, { code: 1, accent: false, format: 0 });
      this._write(lineOutput);
    }

    // empty line
    let endOutput = this._addPrefix('');
    endOutput = this._addDatetime(endOutput);
    this._write(endOutput + ' ');
  }

  /**
   * Display formatted object
   * @param object
   * @param options
   */
  printObject(object: any, options: Omit<RenderOptions, 'isColor'> = {}): void {
    const result = renderObject(object, { ...options, isColor: this.isColor });

    this._write(result);
  }

  /**
   * Print one line
   * @param level
   * @param line
   */
  printLine(level: LogLevel, line: string) {
    const override = this._override(level, line);
    if (override === false) return;

    let message = '';

    message = this._addPrefix(message);
    message = this._addDatetime(message);
    message = this._addIcon(level, message);
    message = this._addColorizedString(override, message);

    this._write(message);
  }

  /**
   * Print log
   * @param level
   * @param message
   * @param args
   */
  print(level: LogLevel, message: string, ...args: any[]): void {
    if (this._level < LOG_LEVEL_CODE[level]) return;

    const objects: any[] = [];
    if (isInterpolatable(message)) {
      message = interpolate(message, ...args);
    } else {
      for (const arg of args) {
        const type = typeof arg;
        if (type in PRIMITIVES || arg === null || arg === undefined) {
          message += ` ${arg}`;
        } else if (type === 'function') {
          message += ` ${arg}`;
        } else if (type === 'object') {
          objects.push(arg);
        }
      }
    }

    // render lines
    const lines = message.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = stripColor(lines[i]);
      this.printLine(level, line);
    }

    // render objects
    for (let i = 0; i < objects.length; i++) {
      this.printObject(objects[i]);
    }
  }

  private _addPrefix(message: string): string {
    if (this.isColor) {
      message = message + markup(this._prefix, { code: this._colorCode!, accent: true, format: 1 });
    } else {
      message = message + this._prefix;
    }

    return message + ' ';
  }

  private _addDatetime(message: string): string {
    const date = new Date();

    let formattedDatetime = '';
    if (this._timeFormat === 'human-readable') {
      formattedDatetime = humanizeFormat(new Date());
    } else if (this._timeFormat === 'ISO') {
      formattedDatetime = date.toISOString();
    } else if (this._timeFormat === 'relative') {
      formattedDatetime = relativeFormat(date, this._begin);
    }

    if (this.isColor) {
      message = message + markup(formattedDatetime, { code: 7, format: 2 });
    } else {
      message = message + formattedDatetime;
    }

    return message + ' ';
  }

  private _addIcon(level: LogLevel, message: string): string {
    if (!this._isUseIcons || !(level in CODE_LOG_ICON)) {
      return message;
    }
    const [icon, code, format, accent] = CODE_LOG_ICON[level];

    if (this.isColor) {
      message = message + markup(icon, { code, format, accent });
    } else {
      message = message + icon;
    }
    return message + ' ';
  }

  private _addColorizedString(line: string, message: string, opts: Partial<MarkupOptions> = {}): string {
    if (this.isColor) {
      message = message + markup(line, { code: this._colorCode!, ...opts });
    } else {
      message = message + line;
    }
    return message;
  }

  private _write(value: string): void {
    console.log(value);
  }
}