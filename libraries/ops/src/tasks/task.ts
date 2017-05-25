import { Transition } from '../transitions/transition';
import { Stateful } from '../transitions/stateful';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';

export interface TaskCompletion<TResult> {
    result?: TResult;
    cancelled?: boolean;
    error?: any;
}

export class Task<TResult = any> extends Stateful {
    constructor(protected executionTransition: Transition<Task, TResult>,
                protected cancellationTransition?: Transition<Task>,
                protected pauseTransition?: Transition<Task>,
                protected resumeTransition?: Transition<Task>) {
        super();
    }

    private neverSubject = new Subject();

    get cancelling() { return !this.cancellationTransition ? this.neverSubject : this.cancellationTransition.transitioning; }
    get cancelled() { return !this.cancellationTransition ? this.neverSubject : this.cancellationTransition.transitioned; }
    get pausing() { return !this.pauseTransition ? this.neverSubject : this.pauseTransition.transitioning; }
    get paused() { return !this.pauseTransition ? this.neverSubject : this.pauseTransition.transitioned; }
    get resuming() { return !this.resumeTransition ? this.neverSubject : this.resumeTransition.transitioning; }
    get resumed() { return !this.resumeTransition ? this.neverSubject : this.resumeTransition.transitioned; }
    get starting() { return this.executionTransition.transitioning; }
    get ended() {
        return <Observable<TaskCompletion<TResult>>>Observable.merge([
            this.executionTransition.transitioned.map(r => <TaskCompletion<TResult>>{ result: r.state }),
            this.cancellationTransition && this.cancellationTransition.transitioned.map(r => <TaskCompletion<TResult>>{ cancelled: true })
        ]);
    }
    get succeeded() { return Observable.onErrorResumeNext(this.executionTransition.transitioned); }
    get failed() { return this.transitioned.catch(err => [err]); }

    protected onExistingTransition(prevTransition: Transition<Stateful>, newTransition: Transition<Stateful>) {
        if (prevTransition === this.executionTransition) {
            newTransition.transitioned.toPromise().then(t => {
                if (this.currentTransition === newTransition)
                    this.currentTransition = this.executionTransition;
            });
            return; // Keep the execution transition.
        }
        super.onExistingTransition(prevTransition, newTransition);
    }

    dispose() {
        super.dispose();
        this.neverSubject.complete();
    }
}
