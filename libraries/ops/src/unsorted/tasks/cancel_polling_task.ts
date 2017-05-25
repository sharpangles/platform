import { Task } from './task';

export class CancelPollingTask<TProgress = any, TResult = any, TError = any> extends Task<TProgress, TResult, TError> {
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
