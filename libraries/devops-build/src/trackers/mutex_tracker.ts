import { TrackerProcess } from '../processes/tracker_process';
import { SubjectTracker } from './subject_tracker';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

/**
 * A tracker that waits for the previous process to finish.
 */
export class MutexTracker<TProgress = any, TError = any> extends SubjectTracker<TProgress, TError> {
    get activeProcess(): TrackerProcess<TProgress, TError> | undefined {
        for (let cur of this.activeProcesses)
            return cur;
        return;
    }

    protected async flowProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        await super.flowProcessAsync(trackerProcess);
        return this.activeProcess === trackerProcess;
    }

    protected queue: TrackerProcess<TProgress, TError>[] = [];

    protected removeProcess(trackerProcess: TrackerProcess<TProgress, TError>) {
        super.removeProcess(trackerProcess);
        if (trackerProcess !== this.queue.splice(0, 1)[0])
            throw new Error('Out of order queue.');
        super.runProcessAsync(trackerProcess);
    }

    async runProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        this.queue.push(trackerProcess);
        if (this.queue.length === 1)
            return super.runProcessAsync(trackerProcess);
        return true;
    }
}
