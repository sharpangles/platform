import { CommonModule } from '@angular/common/common';
import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader, ModuleWithProviders } from '@angular/core';
import { SomethingComponent } from './something.component';

@NgModule({
    declarations: [SomethingComponent],
    imports: [CommonModule]
})
export class AppModule {
}
