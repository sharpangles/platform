/// <reference path="./dependency.ts" />

namespace __sharpangles {
    export class TaskMap<TKey, TSource, TResult> {
        constructor(private _createTask: (key: TKey, source: TSource) => Task<TResult>) {
        }

        private _map = new Map<TKey, { source: TSource, task: Task<TResult> }>();

        async ensureOrCreateAsync(key: TKey, source: TSource) {
            let item = this._map.get(key);
            if (!item) {
                item = { source: source, task: this._createTask(key, source) };
                this._map.set(key, item);
            }
            return item.task.isCompleted ? item.task.result : await item.task;
        }

        /** Ensures a task nown to exist is completed. */
        async ensureAsync(key: TKey) {
            let item = this._map.get(key);
            if (!item)
                throw new Error(`${key} represents a task that does not exist.`);
            return item.task.isCompleted ? item.task.result : await item.task;
        }

        async ensureAllAsync(filter?: (source: TSource) => boolean) {
            let promises = Array.from(this._map.values()).filter(v => !v.task.isCompleted && (!filter || filter(v.source))).map(v => v.task);
            if (promises.length === 0)
                return;
            await Promise.all(promises);
        }

        tryGetSource(key: TKey): TSource | undefined {
            let item = this._map.get(key);
            if (!item)
                return;
            return item.source;
        }
    }

    export class Task<T> implements PromiseLike<T> {
        constructor(private _promiseFactory: () => Promise<T>, private onCancelled?: () => void, _delayStart?: boolean) {
            if (!_delayStart)
                this.trigger();
        }

        async trigger(): Promise<T> {
            if (!this.promise)
                this.promise = this._runAsync();
            else if (this.isCancelled)
                this.promise = <any>Promise.reject(new TaskCancelledError('A task was cancelled.'));
            return this.promise;
        }

        private async _runAsync(): Promise<T> {
            this.result = await this._promiseFactory();
            return this.result;
        }

        protected promise: Promise<T>;
        result: T;
        get isCompleted(): boolean { return this.result !== undefined; }
        isCancelled: boolean;

        cancel() {
            this.isCancelled = true;
            if (this.onCancelled)
                this.onCancelled();
        }

        then<TResult>(onfulfilled: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult> {
            return onrejected ? this.trigger().then(onfulfilled, onrejected) : this.trigger().then(onfulfilled);
        }

        catch(onrejected: (reason: any) => T | PromiseLike<T>): Promise<T> {
            return this.trigger().catch(onrejected);
        }
    }


    export class TaskCancelledError extends Error {
        constructor(message: string) {
            super(message);
            Object.setPrototypeOf(this, TaskCancelledError.prototype);
        }
    }
}
