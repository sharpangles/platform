import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';

export class NgLintActivity extends CommandActivity {
    lastPercent = 0;

    static getCmdArgs(app?: string, aot?: boolean) {
        const result = ['lint'];
        if (app)
            result.push('--app', app);
        if (aot)
            result.push('--aot');
        return result;
    }

    constructor(directory: string, app?: string, aot?: boolean, log?: Log) {
        super(/^win/.test(process.platform) ? 'ng.cmd' : 'ng', NgLintActivity.getCmdArgs(app, aot), directory, log);
    }

    protected logError(data: any) {
        data = (<string>data.toString()).trim();
        if (data.length === 0)
            return;
        const regex = /^\d*%/;
        if (regex.test(data)) {
            const percent = parseInt(data.substr(0, data.indexOf('%')), 10);
            if (percent >= this.lastPercent + 10) {
                this.lastPercent = percent - percent % 10;
                this.log.log(`${this.lastPercent} done.`, LogEntryType.Progress);
            }
            return;
        }
        super.logError(data);
    }
}
