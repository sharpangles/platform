import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';

export class DockerRmiActivity extends CommandActivity {
    constructor(projectPath: string, imageName: string, log?: Log) {
        super('docker', ['rmi', imageName], projectPath, log);
    }

    protected logError(data: any) {
        this.log.log(data, LogEntryType.Error);
    }
}
