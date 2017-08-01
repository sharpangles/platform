import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';
// import * as del from 'del';

export class InstallNpmActivity extends CommandActivity {
    constructor(directory: string, log?: Log) {
        super(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'], directory, log);
    }

    async onRunAsync() {
        // await del(this.cwd + '/package-lock.json', { force: true });
        return await super.onRunAsync();
    }

    protected logError(data: string) {
        data = data.toString();
        if (data.startsWith('npm ERR!'))
            super.logError(data);
        else
            this.log.log(data, LogEntryType.Warning);
    }
}
