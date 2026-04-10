/**
 * Logger port — abstraction for logging throughout the application.
 * Implementations can be swapped (console, file, remote service)
 * without changing consuming code.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Default console-based logger implementation.
 * Formats entries with timestamp, level, and context.
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly context: string) {}

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(data !== undefined && { data }),
    };

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;

    switch (level) {
      case "debug":
        console.debug(prefix, message, data ?? "");
        break;
      case "info":
        console.info(prefix, message, data ?? "");
        break;
      case "warn":
        console.warn(prefix, message, data ?? "");
        break;
      case "error":
        console.error(prefix, message, data ?? "");
        break;
    }
  }
}

/**
 * Factory function to create a logger with a given context.
 * @param context - The module or component name for log identification
 */
export function createLogger(context: string): Logger {
  return new ConsoleLogger(context);
}
