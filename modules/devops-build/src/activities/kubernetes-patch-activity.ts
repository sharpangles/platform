import { CommandActivity } from './command-activity';
import { Log, LogEntryType } from '../log';

export class KubernetesPatchActivity extends CommandActivity {
    constructor(public name: string, imageName: string, log?: Log) {
        super('kubectl', ['patch', 'deployment', name, '-p', `{"spec":{"template":{"spec":{"containers":[{"name":"${name}","image":"${imageName}"}]}}}}`], '.', log);
    }

    protected logOutput(data: any) {
        this.log.log(data);
        if (data.toString() === `deployment "${this.name}" not patched`)
            this.log.log('The image didn\'t change, so no patch was made', LogEntryType.Warning);
        else if (data.toString() === `deployment "${this.name}" patched`)
            this.log.log('Patch succeeded', LogEntryType.Message);
    }
}
