import { SaLazyComponentOutlet } from '../src/directives/sa_lazy_component_outlet';
import { StatefulModule } from '../src/stateful_module';
import { TypeReference, StateChange } from '../src/interfaces';
import { CommonJsNgModuleLoader } from './common_js_ng_module_factory_loader';
import { Component, ViewChild, NgModuleFactoryLoader } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { async, TestBed } from '@angular/core/testing';

@Component({
    selector: 'testComponent',
    template: `
<div>
    <h3>LazyComponentOutlet and StateOutlet with @Input mappings</h3>
    <ng-template [saStateOutlet]="stateForInput" [saLazyComponentOutlet]="widgetUsingInputDecoratorReference" #lazy1="saLazyComponentOutlet" [saStateOutletComponentRef]="lazy1.componentRef">
        <div>Loading...</div>
    </ng-template>
</div>
<div>
    <h3>LazyComponentOutlet and StateOutlet with @State mappings (also sets componentRef explicitly)</h3>
    <ng-template [saStateOutlet]="stateForState" [saLazyComponentOutlet]="widgetUsingStateDecoratorReference" #lazy2="saLazyComponentOutlet" [saStateOutletComponentRef]="lazy2.componentRef">
        <div>Loading...</div>
    </ng-template>
</div>
<div>
    <h3>LazyComponentOutlet and StateOutlet with custom @Stateful</h3>
    <ng-template [saStateOutlet]="stateForStateful" [saLazyComponentOutlet]="widgetCustomizingStateProjectionReference" #lazy3="saLazyComponentOutlet" [saStateOutletComponentRef]="lazy3.componentRef">
        <div>Loading...</div>
    </ng-template>
</div>
<div>
    <h3>LazyComponentOutlet and StateOutlet with inheritance</h3>
    <ng-template [saStateOutlet]="stateForStateful" [saLazyComponentOutlet]="widgetCustomizingStateProjectionReference" #lazy4="saLazyComponentOutlet" [saStateOutletComponentRef]="lazy4.componentRef">
        <div>Loading...</div>
    </ng-template>
</div>
<div>
    <h3>LazyComponentOutlet and StateOutlet with forms, wired by event</h3>
    <ng-template [saStateOutlet]="stateForForms" [saLazyComponentOutlet]="widgetWithControlReference" #lazy5="saLazyComponentOutlet" (saStateOutletStateSet)="onStateSet($event)">
        <div>Loading...</div>
    </ng-template>
</div>
`
})
class TestComponent {
    stateForInput = { someValue: 'stateForInput' };
    stateForState = { someValue: 'stateForState' };
    stateForStateful = { someValue: 'stateForStateful' };
    stateForInheritance = { someValue: 'stateForInheritance' };
    stateForForms = { someValue: 'stateForForms' };

    @ViewChild('lazy1') lazyForInput: SaLazyComponentOutlet;
    @ViewChild('lazy2') lazyForState: SaLazyComponentOutlet;
    @ViewChild('lazy3') lazyForStateful: SaLazyComponentOutlet;
    @ViewChild('lazy4') lazyForInheritance: SaLazyComponentOutlet;
    @ViewChild('lazy5') lazyForForms: SaLazyComponentOutlet;

    widgetCustomizingStateProjectionReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'WidgetCustomizingStateProjection' };
    widgetUsingStateDecoratorReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'WidgetUsingStateDecorator' };
    widgetUsingInputDecoratorReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'WidgetUsingInputDecorator' };
    widgetUsingInheritanceReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'WidgetUsingInheritance' };
    widgetWithControlReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'WidgetWithControl' };

    control: FormGroup = new FormGroup({
    });

    onStateSet(stateChange: StateChange) {
        if (stateChange.control) {
            this.control.addControl('child', stateChange.control);
        }
    }
}

describe('SaStateOutlet', () => {
    let moduleConfig = {
        declarations: [TestComponent],
        imports: [StatefulModule.forRoot()],
        entryComponents: [TestComponent],
        providers: [{ provide: NgModuleFactoryLoader, useClass: CommonJsNgModuleLoader }]
    };
    let testComponent: TestComponent;
    beforeEach(async(async () => {
        TestBed.configureTestingModule(moduleConfig);
        await TestBed.compileComponents();
        let fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges(); // 2 stages of changes, via componentRef.
        await fixture.whenStable();
        testComponent = <TestComponent>fixture.componentInstance;
   }));
    it('should set state using @Input()', () => {
        expect(testComponent.lazyForInput.componentRef && testComponent.lazyForInput.componentRef.instance.someValue).toBe('stateForInput');
    });
    it('should set state using @State()', () => {
        expect(testComponent.lazyForState.componentRef && testComponent.lazyForState.componentRef.instance.someValue).toBe('stateForState');
    });
    it('should set state using @Stateful()', () => {
        expect(testComponent.lazyForStateful.componentRef && testComponent.lazyForStateful.componentRef.instance.someValue).toBe('stateForStateful'.toUpperCase());
    });
});
