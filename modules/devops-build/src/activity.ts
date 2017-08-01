import { Log, LogEntryType } from './log';

export abstract class Activity {
    constructor(log?: Log) {
        this.log = log || new Log();
    }

    log: Log;

    protected abstract onRunAsync(): Promise<boolean>;
    abstract toString(): string;

    async runAsync() {
        if (!this.log.label)
            this.log.label = this.toString();
        this.log.log(`Running ${this.toString()}`, LogEntryType.Progress);
        try {
            if (!await this.onRunAsync())
                return false;
        } catch (err) {
            this.log.log(`Critical activity failure: ${this.toString()}`, LogEntryType.Critical);
            this.log.close();
            return false;
        }
        this.log.log(`Finished ${this.toString()}`, LogEntryType.Progress);
        this.log.close();
        return true;
    }
}
