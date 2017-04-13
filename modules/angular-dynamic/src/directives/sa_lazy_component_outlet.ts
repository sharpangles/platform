import { Directive, Input, Output, OnChanges, EventEmitter, SimpleChanges, NgModuleFactory, ViewContainerRef, TemplateRef, Type, ComponentRef, EmbeddedViewRef, NgModuleRef, ComponentFactoryResolver, ReflectiveInjector, forwardRef } from '@angular/core';
import { TypeReference } from '../interfaces';
import { ComponentTypeLoader } from '../component_type_loader';

/**
 * Dynamically loads a component based on a provided TypeReference.
 * Combines the benefits of ngTemplateOutlet and ngComponentOutlet while dynamically loading type metadata from state.
 * Additionally, componentRef is exposed for use with other directives, such as saStateOutlet.
 * ngComponentOutlet can also be used via pipes on a ComponentTypeLoader.
 * When a component is not loaded or set, either the provided template or ng-content is projected.
 */
@Directive({
    selector: '[saLazyComponentOutlet]',
    exportAs: 'saLazyComponentOutlet'
})
export class SaLazyComponentOutlet implements OnChanges {
    constructor(private viewContainer: ViewContainerRef, private componentTypeLoader: ComponentTypeLoader, private _template: TemplateRef<any>) {
    }

    @Input() saLazyComponentOutlet: TypeReference;
    @Input() saLazyComponentOutletContext: Object;
    @Input() saLazyComponentOutletTemplate: TemplateRef<any>;
    @Input() saLazyComponentOutletContent: any[][];

    @Output() componentChanged = new EventEmitter<SaLazyComponentOutlet>(true);

    private _resolution: Promise<{ module: NgModuleFactory<any>, component: Type<any> }> | null;

    componentRef?: ComponentRef<any>;
    moduleRef?: NgModuleRef<any>;
    viewRef?: EmbeddedViewRef<any>;

    private _moduleFactory: NgModuleFactory<any>;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.saLazyComponentOutlet && changes.saLazyComponentOutlet.previousValue || !this.componentRef && changes.saLazyComponentOutletTemplate)
            this._clear();
        if (!this.componentRef)
            this._enableTemplate();
        if (changes.saLazyComponentOutlet && changes.saLazyComponentOutlet.currentValue)
            this._loadReference();
    }

    private _loadReference() {
        let resolution = this.componentTypeLoader.resolveAsync(this.saLazyComponentOutlet);
        this._resolution = resolution;
        this._resolution.then(result => this._onComponentResolved(resolution, result.module, result.component));
    }

    private _clear() {
        if (this.componentRef) {
            this.viewContainer.remove(this.viewContainer.indexOf(this.componentRef.hostView));
            this.viewContainer.clear();
            delete this.componentRef;
            this.componentChanged.emit(this);
        }
        if (this.viewRef) {
            this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
            delete this.viewRef;
        }
    }

    private _enableTemplate() {
        if (this.viewRef)
            this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
        this.viewRef = this.viewContainer.createEmbeddedView(this.saLazyComponentOutletTemplate || this._template, this.saLazyComponentOutletContext);
    }

    private _onComponentResolved(resolution: Promise<any>, module: NgModuleFactory<any>, component: Type<any>) {
        if (this._resolution !== resolution) // Make sure a change didnt 'cancel' this.
            return;
        let injector = this.viewContainer.injector;
        if (this._moduleFactory !== module) {
            this._moduleFactory = module;
            if (this.moduleRef)
                this.moduleRef.destroy();
            this.moduleRef = module ? module.create(injector) : undefined;
        }
        if (this.moduleRef)
            injector = this.moduleRef.injector;
        let componentFactory = injector.get(ComponentFactoryResolver).resolveComponentFactory(component);
        this._clear();
        injector = ReflectiveInjector.resolveAndCreate([{ provide: forwardRef(() => SaLazyComponentOutlet), useValue: this }], injector);
        this.componentRef = this.viewContainer.createComponent(componentFactory, this.viewContainer.length, injector, this.saLazyComponentOutletContent);
        this.componentChanged.emit(this);
    }
}
