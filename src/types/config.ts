import { Color } from './color';
import { LogLevel } from './log-level';
import { TimeFormat } from './time-format';

/**
 * Configuration object
 */
export interface Config {
  /**
   * Logger prefix, can be unit name, eq server, client, etc.
   */
  prefix?: string;
  /**
   * Output color
   */
  color?: Exclude<Color, 'red'>;
  /**
   * Level of logging default is 'info'
   */
  logLevel?: LogLevel;
  /**
   * Log time format. Default relative
   *
   * @example
   * ISO - 2000-10-31T01:30:00.000
   * relative - Relative time from create instance (01:30:00.000)
   * human-readable - 07.11.2024 20:03:52.411
   */
  timeFormat?: TimeFormat;
  /**
   * Display specify log icons. Default true
   */
  icons?: boolean;
  /**
   * Call each line to get line for write.
   * If returns false, then prevent display line
   * @param line
   */
  override?: (line: string) => string | false;
  /**
   * Function writer, default console.log
   * @param text
   */
  writer?: (text: string) => void;
}