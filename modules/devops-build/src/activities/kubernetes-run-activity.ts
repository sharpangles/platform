import { CommandActivity } from './command-activity';
import { Log } from '../log';

export class KubernetesRunActivity extends CommandActivity {
    constructor(name: string, imageName: string, log?: Log) {
        super('kubectl', ['run', name, '--image', imageName], '.', log);
    }
}
