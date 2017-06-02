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
