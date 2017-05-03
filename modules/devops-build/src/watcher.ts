import { Observable } from 'rxjs/Observable';
import * as chokidar from 'chokidar';
import 'rxjs/add/observable/fromEvent';

export interface WatchChange {
    changes: string[];
}

export class Watcher {
    constructor(public patterns: string | string[], cwd: string) {
        this._cwd = cwd || process.cwd();
        this.watcher = chokidar.watch(this.patterns, { cwd: this._cwd });
        this.changed = Observable.fromEvent(this.watcher, 'change', event => this.createEvent(event));
    }

    private _cwd: string;

    public watcher: chokidar.FSWatcher;
    changed: Observable<WatchChange>;

    createEvent(event: any) {
        return <WatchChange>{};
    }
}
