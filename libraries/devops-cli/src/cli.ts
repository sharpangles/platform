import * as minimist from 'minimist';
import { TrackerFactory } from './tracker_factory';

class CLI {
    constructor() {
        let argv = minimist(process.argv.slice(2));
        if (argv._.length < 1)
            throw new Error('No command specified');
        switch (argv._[0]) {
            case 'serve':
                new TrackerFactory(argv, true);
                break;
            case 'build':
                new TrackerFactory(argv, false);
                break;
            default:
                throw new Error('Unrecognized command');
        }
    }
}

new CLI();
