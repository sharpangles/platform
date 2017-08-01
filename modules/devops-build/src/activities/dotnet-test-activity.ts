import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class DotnetTestActivity extends CommandActivity {
    constructor(public projectPath: string, log?: Log) {
        super('dotnet', ['test', '--no-build',
            '--filter', 'Status=Solid&Type!=External',
            '--logger', 'trx;LogFileName=csharp-results.trx'], projectPath, log);
    }

    protected logOutput(data: string) {
        super.logOutput(data);
        const regex = /^Total tests: \d*. Passed: \d*. Failed: \d*. Skipped: \d*.$/gm;
        if (regex.test(data)) {
            if (data.substr(data.indexOf('Failed: ') + 'Failed: '.length, 2) !== '0.')
                this.logError('Tests failed');
        }
    }

    protected onCode(code) {
        if (code === 1 && this.log.entries.find(e => e.entry.startsWith('No test is available')))
            return;
        super.onCode(code);
    }
}
