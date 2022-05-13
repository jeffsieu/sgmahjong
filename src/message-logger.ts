import type { ReadonlyPlayer } from "./game-state/game-state";

export namespace MessageLogger {
  const logEntries: LogEntry[] = [];

  export const log = (logEntry: LogEntry): void => {
    console.log(logEntry.message);
    logEntries.push(logEntry);
  };

  export const getLogs = (): LogEntry[] => {
    return logEntries;
  };
}

export interface LogEntry {
  message: string;
}

export class PlayerLogEntry {
  constructor(readonly player: ReadonlyPlayer, readonly message: string) {}
}
