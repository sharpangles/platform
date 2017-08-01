import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class DockerPushActivity extends CommandActivity {
    constructor(projectPath: string, imageName: string, log?: Log) {
        super('docker', ['push', imageName], projectPath, log);
    }
}
