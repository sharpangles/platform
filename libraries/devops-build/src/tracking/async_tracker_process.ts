import { TrackerProcess } from './tracker_process';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class AsyncTrackerProcess<TResult = any> extends TrackerProcess {
    constructor(public promiseFactory: () => Promise<TResult>) {
        super();
    }

    result: TResult;

    start() {
        this.promiseFactory().then(r => {
            this.result = r;
            this.succeed();
        }, e => this.fail(e));
        super.start();
    }
}
