import { Injectable, NgModule, ModuleWithProviders } from '@angular/core';

@Injectable()
export class TestService {
}

@NgModule({
})
export class SharedServiceModule {
  static forRoot() {
    return <ModuleWithProviders>{
      ngModule: SharedServiceModule,
      providers: [ TestService ]
    };
  }
}
