import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class DockerBuildActivity extends CommandActivity {
    constructor(projectPath: string, imageName: string, log?: Log) {
        super('docker', ['build', 'bin/Debug/netcoreapp1.1/publish', '-t', imageName], projectPath, log);
    }
}
