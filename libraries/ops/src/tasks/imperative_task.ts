import { Task } from './task';
import { ExplicitTransition, ImperativeTransition } from '../transitions/transition';

export class ImperativeTask<TResult = any> extends Task<TResult> {
    static fromPromise<TResult>(promiseFactory: () => Promise<TResult>) {
        let execution = new ExplicitTransition<Task, TResult>(s => promiseFactory());
        return new ImperativeTask<TResult>(execution);
    }

    constructor(executionTransition: ImperativeTransition<Task, TResult>,
                cancellationTransition?: ImperativeTransition<Task>,
                pauseTransition?: ImperativeTransition<Task>,
                resumeTransition?: ImperativeTransition<Task>) {
        super(executionTransition, cancellationTransition, pauseTransition, resumeTransition);
    }

    async runAsync() {
        await this.runTransitionAsync(<ImperativeTransition<Task>>this.executionTransition);
    }

    /** Attempts to cancel. */
    async tryCancelAsync() {
        if (!this.cancellationTransition)
            return false;
        await this.runTransitionAsync(<ImperativeTransition<Task>>this.cancellationTransition);
        return true;
    }

    /** Attempts to pause. */
    async tryPauseAsync() {
        if (!this.pauseTransition)
            return false;
        await this.runTransitionAsync(<ImperativeTransition<Task>>this.pauseTransition);
        return true;
    }

    /** Attempts to resume. */
    async tryResumeAsync() {
        if (!this.resumeTransition)
            return false;
        await this.runTransitionAsync(<ImperativeTransition<Task>>this.resumeTransition);
        return true;
    }
}
