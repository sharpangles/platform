import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';

export class KubernetesApplyActivity extends CommandActivity {
    constructor(projectPath: string, public name: string, log?: Log) {
        super('bash', ['-c', 'envsubst < kube.yaml | kubectl apply -f -'], projectPath, log);
    }

    protected logOutput(data: any) {
        this.log.log(data);
        if (data.toString() === `deployment "${this.name}" created`)
            this.log.log('Patch succeeded', LogEntryType.Message);
    }
}
