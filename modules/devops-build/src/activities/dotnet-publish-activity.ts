import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class DotnetPublishActivity extends CommandActivity {
    constructor(projectPath: string, log?: Log) {
        super('dotnet', ['publish'], projectPath, log);
    }
}
