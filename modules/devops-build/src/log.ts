import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export enum LogEntryType {
    Trace,
    Message,
    Progress,
    Warning,
    Error,
    Critical
}

export class Log {
    constructor(public label?: string, public minOutputLevel: LogEntryType = LogEntryType.Message) {
    }

    entries: LogEntry[] = [];

    log(message: string, type?: LogEntryType) {
        this.logEntry({ time: new Date(), entry: message, type: type || LogEntryType.Trace });
    }

    logEntry(entry: LogEntry) {
        this.entries.push(entry);
        if (entry.type >= this.minOutputLevel)
            this.write(entry, true, m => console.log(m));
    }

    write(entry: LogEntry, useColor: boolean, target: (message: string) => void) {
        const clk = useColor && this.getChalk(entry.type);
        let message = `${entry.time.toLocaleTimeString()} (${LogEntryType[entry.type]}): ${entry.entry}`;
        if (this.label)
            message = this.label + ' ' + message;
        target(clk ? clk(message) : message);
    }

    writeAll(minOutputLevel: LogEntryType = LogEntryType.Trace, useColor: boolean = true, target: (message: string) => void = m => console.log(m)) {
        for (const entry of this.entries) {
            if (entry.type >= minOutputLevel)
                this.write(entry, useColor, target);
        }
    }

    private getChalk(logEntryType: LogEntryType): ((str: string) => string) | undefined {
        switch (logEntryType) {
            case LogEntryType.Progress:
                return chalk.bold.blue;
            case LogEntryType.Warning:
                return chalk.bold.yellow;
            case LogEntryType.Error:
                return chalk.bold.red;
            case LogEntryType.Critical:
                return chalk.bold.bgRed.bold;
            default:
                return;
        }
    }

    close() {
        if (process.env.BUILD_ARTIFACTSTAGINGDIRECTORY) {
            const fd = fs.openSync(`${process.env.BUILD_ARTIFACTSTAGINGDIRECTORY}${path.sep}${this.label || 'log'}.txt`, 'a');
            this.writeAll(LogEntryType.Trace, false, m => fs.writeSync(fd, m + os.EOL));
            fs.closeSync(fd);
        }
    }
}

export interface LogEntry {
    time: Date;
    entry: string;
    type: LogEntryType;
}
