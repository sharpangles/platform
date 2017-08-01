import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class DockerTagActivity extends CommandActivity {
    constructor(projectPath: string, baseImageName: string, buildTagName: string, labelTagName: string, log?: Log) {
        super('docker', ['tag', `${baseImageName}:${buildTagName}`, `${baseImageName}:${labelTagName}`], projectPath, log);
    }
}
