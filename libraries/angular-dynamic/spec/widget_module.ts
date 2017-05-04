import { StateChange } from '../src/interfaces';
import { StateMapper } from '../src/state_mapper';
import { Control, Stateful, State } from '../src/metadata';
import { Component, NgModule, Input, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedServiceModule, TestService } from './shared_service_module';

export interface IWidgetState {
    someValue: string;
}

/** AOT still checks the Stateful decorator, so we have to export functions for it. */
export function getState(injector: Injector, component: WidgetCustomizingStateProjection) {
    return <IWidgetState>{ someValue: component.someValue };
}
export function setState(injector: Injector, component: any, state: IWidgetState): StateChange {
    (<WidgetCustomizingStateProjection>component).someValue = state ? state.someValue.toUpperCase() : null;
    return {};
}

@Component({
    selector: 'widgetCustomizingStateProjection',
    template: `WidgetCustomizingStateProjection: {{ someValue || "no state" }}`
})
@Stateful({
    getState: getState,
    setState: setState
})
export class WidgetCustomizingStateProjection implements IWidgetState {
    @Input() someValue: any;
}

@Component({
    selector: 'WidgetUsingStateDecorator',
    template: `WidgetUsingStateDecorator: {{ someValue || "no state" }}`,
})
export class WidgetUsingStateDecorator implements IWidgetState {
    @State() someValue: any;
}

@Component({
    selector: 'widgetUsingInputDecorator',
    template: `WidgetUsingInputDecorator: {{ someValue || "no state" }}`,
})
export class WidgetUsingInputDecorator implements IWidgetState {
    @Input() someValue: any;
}

@Component({
    selector: 'widget',
    template: `Widget: {{ someValue || "no state" }}`,
})
export class WidgetUsingInheritance extends StateMapper {
    getState() {
        return <IWidgetState>{ someValue: this.someValue };
    }
    setState(state: IWidgetState): StateChange {
        this.someValue = state ? state.someValue.toUpperCase() : null;
        return {};
    }

    someValue: any;
}

@Component({
    selector: 'widget',
    template: `Widget: {{ someValue || "no state" }}`,
})
export class Widget implements IWidgetState {
    constructor(public injector: Injector, public testService: TestService) {
    }

    @Input() someValue: any;
}

@Component({
    selector: 'widgetWithControl',
    template: `WidgetUsingInputDecorator: {{ someValue || "no state" }}`,
})
export class WidgetWithControl implements IWidgetState {
    @Control() control: FormControl = new FormControl();
    @Input() someValue: any;
}

let DYNAMIC_COMPONENTS = [WidgetCustomizingStateProjection, WidgetUsingStateDecorator, WidgetUsingInputDecorator, WidgetUsingInheritance, Widget, WidgetWithControl];

@NgModule({
    declarations: [DYNAMIC_COMPONENTS],
    imports: [SharedServiceModule],
    exports: [SharedServiceModule, DYNAMIC_COMPONENTS],
    entryComponents: [DYNAMIC_COMPONENTS]
})
export class WidgetModule {
}
