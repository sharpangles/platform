import { FeatureReference } from '../feature';
import { ModuleLoader, ModuleResolutionContext } from './module_loader';
import { Task, TaskMap } from '../../task_map';

export interface BrowserModuleResolutionContext extends ModuleResolutionContext {
    /** If true, the script tag will use the module type. */
    isModule?: boolean;
    isDeferred?: boolean;
    isAsync?: boolean;
}

export class BrowserModuleLoader extends ModuleLoader<BrowserModuleResolutionContext> {
    static create(): FeatureReference {
        return new FeatureReference(BrowserModuleLoader);
    }

    private _taskMap = new TaskMap<string, BrowserModuleResolutionContext, void>((key, context) => new Task<void>(() => this._createTagAsync(context)));

    onLoadModuleAsync(context: BrowserModuleResolutionContext): Promise<any> {
        return this._taskMap.ensureOrCreateAsync(context.key, context);
    }

    private _createTagAsync(context: BrowserModuleResolutionContext) {
        return new Promise<void>((resolve, reject) => {
            let el = document.createElement('script');
            el.setAttribute('src', context.key);
            el.setAttribute('type', context.isModule ? 'module' : 'application/javascript');
            if (context.isAsync)
                el.setAttribute('async', 'true');
            if (context.isDeferred)
                el.setAttribute('defer', 'true');
            el.onerror = (event) => {
                reject(event.error);
            };
            el.onload = (event) => {
                resolve();
            };
            document.head.appendChild(el);
        });
    }
}
