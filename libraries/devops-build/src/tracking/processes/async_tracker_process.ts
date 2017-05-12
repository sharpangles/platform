import { CancelPollingProcess } from './cancel_polling_process';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export abstract class AsyncTrackerProcess<TResult = any, TProgress = any, TError = any> extends CancelPollingProcess<TProgress, TError> {
    protected abstract runAsync(): Promise<TResult>;

    result: TResult;

    protected onStart() {
        this.onStartAsync();
    }

    private async onStartAsync() {
        try {
            let result = await this.runAsync();
            if (this.isCancelled)
                return;
            this.result = result;
            this.succeed();
        }
        catch (err) {
            this.fail(err);
            return;
        }
    }


    static create<TResult = any, TProgress = any, TError = any>(promiseFactory: () => Promise<TResult>): AsyncTrackerProcess<TResult, TProgress, TError> {
        return new ExplicitAsyncTrackerProcess<TResult, TProgress, TError>(promiseFactory);
    }
}

class ExplicitAsyncTrackerProcess<TResult = any, TProgress = any, TError = any> extends AsyncTrackerProcess<TResult, TProgress, TError> {
    constructor(private promiseFactory: () => Promise<TResult>) {
        super();
    }

    protected runAsync(): Promise<TResult> {
        return this.promiseFactory();
    }
}
