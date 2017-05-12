import { TrackerProcess } from '../tracker_process';

export class CancelPollingProcess<TProgress = any, TError = any> extends TrackerProcess<TProgress, TError> {
    private cancelResolve?: () => void;

    protected onCancelAsync(): Promise<boolean> {
         if (!this.isStarted)
            return Promise.resolve(false);
        return new Promise(resolve => this.cancelResolve = resolve);
    }

    protected setProgress(progress: TProgress) {
        if (this.cancelResolve) {
            this.cancelResolve();
            return;
        }
        super.setProgress(progress);
    }
}
