import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';
import * as stripAnsi from 'strip-ansi';

export class NgTestActivity extends CommandActivity {
    constructor(directory: string, log?: Log) {
        super(/^win/.test(process.platform) ? 'ng.cmd' : 'ng', ['test', '--single-run'], directory, log);
    }

    lastPercent = 0;

    latestFailureReport?: string;
    latestSuccessReport?: string;
    inTests = false;

    /** Otherwise we have to eject webpack config and disable stuff */
    stupidSourceMapWarningCount = 0;

    protected logOutput(data: any) {
        const stringData = stripAnsi((<string>data.toString()).trim());
        if (!this.inTests && stringData.indexOf('Connected on socket') >= 0)
            this.inTests = true;
        if (this.inTests) {
            this.log.log(stringData, LogEntryType.Message);
            if (/\Executed \d* of \d* \(\d* FAILED\)/gm.test(stringData))
                this.latestFailureReport = stringData;
            else if (/\Executed \d* of \d* SUCCESS/gm.test(stringData))
                this.latestSuccessReport = stringData;
        } else
            super.logOutput(data);
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
        if (/WARNING in .*@angular\/compiler\/@angular\/compiler.es5.js/.test(data))
            this.stupidSourceMapWarningCount = 5;
        if (this.stupidSourceMapWarningCount > 0) {
            this.stupidSourceMapWarningCount--;
            super.logOutput(data);
            return;
        }
        super.logError(data);
    }

    protected onCode(code: any) {
        if (this.latestFailureReport)
            this.log.log(this.latestFailureReport, LogEntryType.Error);
        else if (!this.latestSuccessReport)
            this.log.log('Tests never ran', LogEntryType.Error);
        super.onCode(code);
    }
}
