import { CancellationToken, CancellationTokenSource } from '@sharpangles/lang';
import { SubjectTransition } from './subject_transition';

export class ImperativeTransition<TInput, TResult> extends SubjectTransition<TInput, TResult> {
    transitionAsync(input: TInput, cancellationToken?: CancellationToken) {
        this.promise = this.createTransitionPromise(input, cancellationToken);
        return this.promise;
    }

    promise?: Promise<TResult>;
    private cancellationTokenSource = new CancellationTokenSource();

    protected async createTransitionPromise(input: TInput, cancellationToken?: CancellationToken): Promise<TResult> {
        this.setTransitioning(input);
        let result: TResult;
        try {
            result = await this.onTransitioningAsync(input, CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token);
        }
        catch (err) {
            this.fail(err);
            throw err;
        }
        finally {
            delete this.promise;
        }
        this.setTransitioned(result);
        return result;
    }

    protected async onTransitioningAsync(input: TInput, cancellationToken: CancellationToken): Promise<TResult> {
        return <any>undefined;
    }

    dispose() {
        if (this.inTransition)
            this.cancellationTokenSource.cancel();
        super.dispose();
    }
}
