import * as minimistProxy from 'minimist';
import { ContextFactory } from './context_factory';

const minimist: any = (<any>minimistProxy).default || minimistProxy; // https://github.com/rollup/rollup/issues/1267

export class CLI {
    constructor() {
        let argv = minimist(process.argv.slice(2));
        if (argv._.length < 1)
            throw new Error('No command specified');
        switch (argv._[0]) {
            case 'serve':
                new ContextFactory().buildAsync(false);
                break;
            case 'build':
                new ContextFactory().buildAsync(true);
                break;
            default:
                throw new Error('Unrecognized command');
        }
    }
}
