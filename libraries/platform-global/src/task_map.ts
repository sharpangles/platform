/**
 * Keeps track of tasks by key, also holding on to an arbitrary source object.
 */
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

    /** Ensures a task known to exist is completed. */
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

    setResult(key: TKey, source: TSource, result: TResult) {
        this._map.set(key, { source: source, task: Task.fromResult<TResult>(result) });
    }
}

export class Task<T> implements PromiseLike<T> {
    constructor(private _promiseFactory: () => Promise<T>, _delayStart?: boolean) {
        if (!_delayStart)
            this.trigger();
    }

    static fromResult<T>(result: T) {
        let task = new Task<T>(<any>undefined, true);
        task._result = result;
        return task;
    }

    async trigger(): Promise<T> {
        if (!this.promise)
            this.promise = this._runAsync();
        return this.promise;
    }

    private async _runAsync(): Promise<T> {
        this.result = await this._promiseFactory();
        return this.result;
    }

    protected promise: Promise<T>;
    private _result: T;
    get result(): T { return this._result; } set result(r: T) { this._result = r; this.isCompleted = true; }
    isCompleted: boolean;

    then<TResult>(onfulfilled: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult> {
        return onrejected ? this.trigger().then(onfulfilled, onrejected) : this.trigger().then(onfulfilled);
    }

    catch(onrejected: (reason: any) => T | PromiseLike<T>): Promise<T> {
        return this.trigger().catch(onrejected);
    }
}
