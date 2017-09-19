import { ComponentTypeLoader } from '../src/component_type_loader';
import { StatefulModule } from '../src/stateful_module';
import { TypeReference } from '../src/interfaces';
import { CommonJsNgModuleLoader } from './common_js_ng_module_factory_loader';
import { NgModuleFactoryLoader } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

describe('ComponentTypeLoader', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ StatefulModule.forRoot() ],
        providers: [ComponentTypeLoader, { provide: NgModuleFactoryLoader, useClass: CommonJsNgModuleLoader }]
      });
    });

    it('should load', async(async () => {
        let loader: ComponentTypeLoader = TestBed.get(ComponentTypeLoader);
        let result = await loader.resolveAsync(<TypeReference>{ moduleName: '../spec/widget_module#WidgetModule', componentTypeName: 'Widget' });
        expect(result && result.component && result.component.name).toBe('Widget', 'Could not load the Widget component type');
    }));
});
