declare module 'devel-logger' {
  export type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

  export type LogLevel = 'silence' | 'info' | 'warn' | 'error' | 'debug';

  export type TimeFormat = 'ISO' | 'relative' | 'human-readable';

  /**
   * Configuration object
   */
  export interface Config {
    /**
     * Logger prefix, can be unit name, eq server, client, etc.
     */
    prefix: string;
    /**
     * Output color
     */
    color: Exclude<Color, 'red'>;
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
  }

  export interface ColorizeOpts {
    code: number;
    accent?: boolean;
    format?: number;
  }

  export class DevLogger {
    constructor(config: Config);

    public print(message: string, ...args: any[]): void;

    public info(message: string, ...args: any[]): void;

    public warn(message: string, ...args: any[]): void;

    public debug(message: string, ...args: any[]): void;

    public error(message: string | Error | any): void;

    public setLogLevel(logLevel: LogLevel): void;
  }
}