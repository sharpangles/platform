import { TrackerProcess } from '../tracking/tracker_process';
import { LoadSource, LoadProgress } from './load_source';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export class LoadProcess<TData = any> extends TrackerProcess<LoadProgress, any> {
    constructor(public loadSource: LoadSource<TData>) {
        super();
    }

    private cancelResolve?: () => void;

    protected onCancelAsync(): Promise<boolean> {
         if (!this.isStarted)
            return Promise.resolve(false);
        return new Promise(resolve => this.cancelResolve = resolve);
    }

    private async readAsync() {
        try {
            await this.loadSource.readAsync(progress => {
                if (this.cancelResolve) {
                    this.cancelResolve();
                    return;
                }
                this.setProgress(progress);
            });
        }
        catch (err) {
            this.fail(err);
            return;
        }
        this.succeed();
        return;
    }

    start() {
        super.start();
        this.readAsync();
    }

    dispose() {
        this.loadSource.dispose();
    }
}
