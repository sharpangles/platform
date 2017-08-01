import { StatefulModule } from '../src/stateful_module';
import { CommonJsNgModuleLoader } from '../src/common_js_ng_module_factory_loader';
import { NgModuleFactory } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { WidgetModule } from './widget_module';

describe('CommonJsNgModuleLoader', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ StatefulModule.forRoot() ],
        providers: [CommonJsNgModuleLoader]
      });
    });

    it('should load', async(async () => {
        let loader: CommonJsNgModuleLoader = TestBed.get(CommonJsNgModuleLoader);
        let widgetModule: NgModuleFactory<WidgetModule> = await loader.load('../spec/widget_module#WidgetModule');
        expect(widgetModule instanceof NgModuleFactory).toBeTruthy();
    }));
});
