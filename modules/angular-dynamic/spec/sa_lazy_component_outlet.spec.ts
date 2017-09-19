import { SaLazyComponentOutlet } from '../src/directives/sa_lazy_component_outlet';
import { StatefulModule } from '../src/stateful_module';
import { TypeReference } from '../src/interfaces';
import { CommonJsNgModuleLoader } from './common_js_ng_module_factory_loader';
import { Component, ViewChild, Input, NgModuleFactoryLoader } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Widget } from './widget_module';
import { TestService } from './shared_service_module';

@Component({
    selector: 'testComponent',
    template: `
<ng-container *saLazyComponentOutlet="widgetReference">
    <div class="loading">Loading...</div>
</ng-container>
`,
    viewProviders: [TestService]
})
class TestComponent {
    @Input() widgetReference: TypeReference;
    @ViewChild(SaLazyComponentOutlet) outlet: SaLazyComponentOutlet;
}


describe('SaLazyComponentOutlet', () => {
    let moduleConfig = {
        declarations: [TestComponent],
        imports: [StatefulModule.forRoot()],
        entryComponents: [TestComponent],
        providers: [{ provide: NgModuleFactoryLoader, useClass: CommonJsNgModuleLoader }]
    };
    beforeEach(async(async () => {
        TestBed.configureTestingModule(moduleConfig);
        await TestBed.compileComponents();
    }));
    it('should transition from loading to a lazily loaded widget', async(async () => {
        let fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        let testComponent = <TestComponent>fixture.componentInstance;
        let loadingElement = fixture.debugElement.query(By.css('.loading'));
        expect(loadingElement && loadingElement.name === 'div').toBeTruthy('The loading element is not present prior to loading the widget');
        testComponent.widgetReference = <TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'Widget' };
        fixture.detectChanges();
        await fixture.whenStable();
        let widget: Widget = testComponent.outlet.componentRef && testComponent.outlet.componentRef.instance;
        expect(widget instanceof Widget).toBeTruthy();
        expect(widget.injector.get(TestService)).toBeTruthy('The injector was not wired up correctly');
        expect(widget.testService).toBeTruthy('The shared srevice is not accessible to the dynamic child');
    }));
});
