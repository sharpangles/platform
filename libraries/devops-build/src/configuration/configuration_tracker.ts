import { WrappedLoadSource } from '../loading/wrapped_load_source';
import { LoadSource } from '../loading/load_source';
import { JsonLoadSource } from '../loading/json_load_source';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { LoadProcess } from '../loading/load_process';
import { OverridingTracker } from '../tracking/overriding_tracker';
import { Observable } from 'rxjs/Observable';
import * as extendProxy from 'deep-extend';

const extend: any = (<any>extendProxy).default || extendProxy; // https://github.com/rollup/rollup/issues/1267

export interface ConfigurationConfig {
    loadType: 'file' | 'watch';
    loadConfig: any;
    parent: { [key: string]: any };
}

export class ConfigurationTracker extends OverridingTracker<LoadProcess<{ [key: string]: any }>, ConfigurationConfig> {
    constructor() {
        super();
        super.succeeded.subscribe(r => this.succeededSubject.next(r));
    }

    /** Always recalls the last successful run. */
    get succeeded(): Observable<LoadProcess<{ [key: string]: any }>> { return this.succeededSubject; }
    private succeededSubject = new AsyncSubject<LoadProcess<{ [key: string]: any }>>();

    private loadSourceFactory: () => LoadSource<{ [key: string]: any }>;

    configure(config: ConfigurationConfig) {
        switch (config.loadType) {
            case 'file':
                this.loadSourceFactory = () => new JsonLoadSource(config.loadConfig.file);
                break;
            default:
                throw new Error('Unrecognized load type.');
        }
        this.runProcess(undefined);
    }

    protected createProcess(state: any) {
        if (!this.loadSourceFactory)
            return;
        return new LoadProcess<{ [key: string]: any }>(new WrappedLoadSource(this.loadSourceFactory(), original => extend({}, parent, original)));
    }
}
