import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SaStateOutlet } from './directives/sa_state_outlet';
import { SaFormControl } from './directives/sa_form_control';
import { SaLazyComponentOutlet } from './directives/sa_lazy_component_outlet';
import { ComponentTypeLoader } from './component_type_loader';
import { StateMapperFactory } from './state_mapper_factory';
import { AngularReflector } from './angular_reflector';

@NgModule({
  declarations: [SaStateOutlet, SaLazyComponentOutlet, SaFormControl],
  imports: [ReactiveFormsModule],
  exports: [SaStateOutlet, SaLazyComponentOutlet, SaFormControl, ReactiveFormsModule]
})
export class StatefulModule {
  static forRoot() {
    return <ModuleWithProviders>{
      ngModule: StatefulModule,
      providers: [
        ComponentTypeLoader,
        StateMapperFactory,
        AngularReflector
      ]
    };
  }
}
