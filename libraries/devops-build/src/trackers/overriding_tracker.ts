import { TrackerProcess } from '../processes/tracker_process';
import { SubjectTracker } from './subject_tracker';
import 'rxjs/add/operator/toPromise';

/**
 * A tracker that cancels any existing process when triggered.
 */
export class OverridingTracker<TProgress = any, TError = any> extends SubjectTracker<TProgress, TError> {
    get activeProcess(): TrackerProcess<TProgress, TError> | undefined {
        for (let cur of this.activeProcesses)
            return cur;
        return;
    }

    protected async flowProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        await super.flowProcessAsync(trackerProcess);
        return this.activeProcess === trackerProcess;
    }

    async runProcessAsync(trackerProcess: TrackerProcess<TProgress, TError>) {
        if (this.activeProcess) {
            let curProcess = this.activeProcess;
            if (!curProcess.isStarted)
                return false;
            if (!curProcess.isCancelled)
                await curProcess.cancelAsync();
            await curProcess.completed.toPromise();
            if (curProcess !== this.activeProcess)
                return false;
        }
        return super.runProcessAsync(trackerProcess);
    }
}
