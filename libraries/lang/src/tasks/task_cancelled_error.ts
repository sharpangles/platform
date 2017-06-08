export class TaskCancelledError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, TaskCancelledError.prototype);
    }
}
