/**
 * Severity levels for logging
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Logger utility with timestamps and severity levels
 */
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): string {
    const timestamp = Logger.formatTimestamp();
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  static debug(message: string, data?: unknown): void {
    console.log(Logger.formatMessage(LogLevel.DEBUG, message, data));
  }

  static info(message: string, data?: unknown): void {
    console.log(Logger.formatMessage(LogLevel.INFO, message, data));
  }

  static warn(message: string, data?: unknown): void {
    console.warn(Logger.formatMessage(LogLevel.WARN, message, data));
  }

  static error(message: string, data?: unknown): void {
    console.error(Logger.formatMessage(LogLevel.ERROR, message, data));
  }
}
