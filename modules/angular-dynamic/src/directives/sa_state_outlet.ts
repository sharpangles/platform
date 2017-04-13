import { Input, Output, Directive, OnChanges, OnDestroy, SimpleChange, EventEmitter, ComponentRef, Optional, Self, ChangeDetectorRef } from '@angular/core';
import { SaLazyComponentOutlet } from './sa_lazy_component_outlet';
import { StateChange } from '../interfaces';
import { StateMapperFactory } from '../state_mapper_factory';

export abstract class SaStateOutletBase implements OnChanges {
    constructor(private stateMapperFactory: StateMapperFactory) {
    }

    /**
     * When https://github.com/angular/angular/issues/8563 is implemented, we should be able to query the component directly and could get rid of the ComponentRef input.
     * This will also allow us to bring back the 'default' child component concept via ng-content.
     */
    @Input() saStateOutlet: any;

    @Output() saStateOutletStateSet = new EventEmitter<StateChange>(false);

    protected abstract get componentRef(): ComponentRef<any> | undefined;

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (!this.componentRef)
            return;
        let stateful = this.stateMapperFactory.get(this.componentRef.componentType);
        let stateChange = stateful.setState(this.componentRef.injector, this.componentRef.instance, this.saStateOutlet);
        this.saStateOutletStateSet.emit(stateChange);
    }

    getState() {
        if (!this.componentRef)
            return;
        let stateful = this.stateMapperFactory.get(this.componentRef.componentType);
        return stateful.getState(this.componentRef.injector, this.componentRef.instance);
    }
}

/**
 * Projects state into a child component.
 */
@Directive({
    // selector: "[saStateOutlet][saStateOutletComponentRef]",
    selector: '[saStateOutlet]',
    exportAs: 'saStateOutlet'
})
export class SaStateOutlet extends SaStateOutletBase {
    constructor(stateMapperFactory: StateMapperFactory) {
        super(stateMapperFactory);
    }

    @Input() saStateOutletComponentRef?: ComponentRef<any>;
    protected get componentRef(): ComponentRef<any> | undefined { return this.saStateOutletComponentRef; }
}

// /**
//  * Projects state into a child component.
//  */
// @Directive({
//     selector: "[saStateOutlet]:not([saStateOutletComponentRef])",
//     exportAs: 'saStateOutlet'
// })
// export class SaStateOutletImplicit extends SaStateOutletBase implements OnDestroy {
//     constructor(stateMapperFactory: StateMapperFactory, changeDetectorRef: ChangeDetectorRef, @Self() saLazyComponentOutlet: SaLazyComponentOutlet) {
//         super(stateMapperFactory);
//         if (saLazyComponentOutlet) {
//             this.subscription = saLazyComponentOutlet.componentChanged.subscribe(c => {
//                 this.lazyComponentRef = c.componentRef;
//                 changeDetectorRef.detectChanges();
//             });
//         }
//     }

//     private subscription: any;
//     private lazyComponentRef?: ComponentRef<any>;
//     protected get componentRef(): ComponentRef<any> | undefined { return this.lazyComponentRef; }

//     ngOnDestroy() {
//         if (this.subscription) {
//             this.subscription.unsubscribe();
//         }
//     }
// }
