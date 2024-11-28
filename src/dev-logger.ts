import { BaseLogger } from './classes/base-logger';

export class DevLogger extends BaseLogger {

  debug(message: string, ...args: any[]): void {
    this.print('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.print('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.print('warn', message, ...args);
  }

  error(error: Error | string | any): void {
    this.printError(error);
  }
}