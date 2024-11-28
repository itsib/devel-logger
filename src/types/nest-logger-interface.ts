export type NestLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

export interface NestLoggerInterface {
  log(message: any, ...optionalParams: any[]): any;

  error(message: any, ...optionalParams: any[]): any;

  warn(message: any, ...optionalParams: any[]): any;

  debug?(message: any, ...optionalParams: any[]): any;

  verbose?(message: any, ...optionalParams: any[]): any;

  fatal?(message: any, ...optionalParams: any[]): any;

  setLogLevels?(levels: NestLogLevel[]): any;
}