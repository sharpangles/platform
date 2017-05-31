import { Trackable } from '../trackable';

/**
 * A process that starts, progresses, and the completes.
 * Completion can be due to success, failure, or cancellation.
 */
export interface Task<TProgress = any, TResult = any, TError = any> extends Trackable<Task<TProgress, TResult, TError>, TProgress, TResult, TError> {
    start();
    cancel();

    progress?: TProgress;
    isStarted: boolean;
    error?: TError;
    isFinished: boolean;
}
