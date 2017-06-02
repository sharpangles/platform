import { CancellationToken } from '@sharpangles/lang';
import { SubjectTransition } from './subject_transition';

export class ImperativeTransition<TResult> extends SubjectTransition<TResult> {
    transitionAsync(cancellationToken?: CancellationToken) {
        this.promise = this.createTransitionPromise();
        return this.promise;
    }

    promise?: Promise<TResult>;

    protected async createTransitionPromise(cancellationToken?: CancellationToken): Promise<TResult> {
        this.setTransitioning();
        let result: TResult;
        try {
            result = await this.onTransitioningAsync();
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

    protected async onTransitioningAsync(cancellationToken?: CancellationToken): Promise<TResult> {
        return <any>undefined;
    }
}
