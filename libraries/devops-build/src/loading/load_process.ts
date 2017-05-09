import { TrackerProcess } from '../processes/tracker_process';
import { LoadSource, LoadProgress } from './load_source';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export abstract class LoadProcess extends TrackerProcess<LoadProgress, any> {
    constructor(public loadSource: LoadSource) {
        super();
    }

    private cancelResolve?: () => void;

    protected onCancelAsync(): Promise<boolean> {
         if (!this.isStarted)
            return Promise.resolve(false);
        return new Promise(resolve => this.cancelResolve = resolve);
    }


    protected applyBuffer(buffer: Buffer, offset: number, bytesRead: number) {
    }

    protected abstract getBufferSize();
    protected abstract getBufferOffset();

    private async readAsync() {
        try {
            this.loadSource.openAsync();
            while (true) {
                if (this.cancelResolve) {
                    this.cancelResolve();
                    return;
                }
                if (!await this.loadSource.readNextAsync())
                    break;
                this.setProgress(this.loadSource.progress);
            }
        }
        catch (err) {
            this.fail(err);
            return;
        }
        finally {
            await this.loadSource.closeAsync();
        }
        this.succeed();
        return;
    }

    start() {
        this.readAsync();
    }

    dispose() {
        this.loadSource.dispose();
    }
}
