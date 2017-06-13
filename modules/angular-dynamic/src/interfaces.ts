import { AbstractControl } from '@angular/forms';

export interface StateChange<TState = any> {
    control?: AbstractControl;
    state: TState;
}

/**
 * A serializable reference to a component.
 */
export interface TypeReference {
    /** The module name to use for resolving relative references.  Use this for static values provided inside another module, such as in unit tests. */
    moduleId?: string;

    /** The module name, using the same format as lazy loaded modules. */
    moduleName?: string;

    /** The name of the component type listed in the entryComponents of the referenced NgModule. */
    componentTypeName?: string;
}
