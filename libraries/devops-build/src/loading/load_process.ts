import { AsyncTrackerProcess } from '../tracking/processes/async_tracker_process';
import { LoadSource, LoadProgress } from './load_source';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class LoadProcess<TData = any> extends AsyncTrackerProcess<TData, LoadProgress> {
    constructor(public loadSource: LoadSource<TData>) {
        super();
    }

    protected runAsync() {
        return this.loadSource.readAsync(progress => this.setProgress(progress));
    }

    dispose() {
        this.loadSource.dispose();
    }
}
