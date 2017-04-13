# @sharpangles/angular-dynamic

## Dynamic Component Loading for Angular.

While @angular/router works great for explicitly coded transitions, sometimes component hierarchies are determined from external state.
The router does provide some mechanisms to dynamically create routes, lazy load modules, and map state, however sometimes you don't want to bring along history, urls, and knowledge on the child-side of its involvement in routing.
Additionally, without lifecycle hooks during the loading process it is difficult to separate concerns across other hierarchical structures, such as forms.

This library provides the directives needed to manage the process of loading a child component and mapping its hierarchical information.
- saLazyComponentOutlet: A directive that loads dynamic child components by combining features from ngTemplateOutlet, ngComponentOutlet, and dynamic type resolution via ComponentTypeLoader.
- saStateOutlet: A directive that projects state into dynamically loaded components.  Typically used in conjunction with saLazyComponentOutlet.
- saFormControl: A directive that separates concerns of control building from parent form membership and submission.

Example usage with both dynamic loading and state projection:
```html
<ng-template [saStateOutlet]="stateObjectGoesHere" [saLazyComponentOutlet]="typeReferenceGoesHere" #lazy="saLazyComponentOutlet" [saStateOutletComponentRef]="lazy.componentRef">
    <div>Loading...</div>
</ng-template>
```

- By default, state is mapped to @Inputs based on matching json properties.  If @Input() is used with a parameter, that parameter determines the expected name of the json property.
- When state needs to be decoupled from inputs, use the @State decorator instead.  If any @State decorator is present, they will be used exclusively.
- Additionally, a component can extend StateMapper to provide its own instance-level state mapping.
- Finally, a component can have its mapping set directly by type on the StateMapperFactory.  This is useful for third-party components with more complex mapping requirements.  If the child is aware of being dynamic, it can use the @Stateful class decorator.

## Forms
When composing a parent control from child controls the child should be responsible for its structure while the parent should be responsible for its place in the overall interaction scenario with the user.
Take an address as an example.  It should define a control containing the lines, city, state, and zip.  Perhaps it even adds async validators to a postal API.
However, it should not be responsible for determining the transactional role it plays in submission.
Additionally, the parent is what knows if it is the home address, work address, or a member in a list of shipping addresses.
This separation is supported across the dynamic boundary by the following:
- A @Control() decorator that can be used on a property for the child component.
- The SaFormControl directive, which can be useful even without dynamic loading (see [this proposal](https://github.com/angular/angular/issues/10195)).

Example of saFormControl:
```html
<form [formGroup]="control" (submit)="submit($event)">
    <p formArrayName="list"><child *ngFor="let child of childValues; let i = index" [value]="child" #comp [formControlName]="i" [saFormControl]="comp.control"></child></p>
</form>

```

## Module loading
The goal of this library is to provide the means to push new components to the client that could have been written at the time the user started navigating the site.
It is common to have a shared kernel between the initially loaded modules and the dynamically injected ones, including angular at the very least.
This library is agnostic of module loading techniques.  However, currently there is no mechanism to create staged static compilations.
For now this leads to less optimal minification.  However, size is often a much lower priority than dynamic content for enterprise applications.
Here are suggestions on module and minification scenarios:

#### Use simple minifications (i.e. google closure compiler in simple mode) and ES6 module loading (either native or SystemJS).
Take a scenario with a single static bundle and a single lazy loaded dynamic bundle which relies on sharing code with the static bundle.
The static bundle cannot use advanced minification scenarios that rename public members used by the dynamic bundle.
Additionally, the dynamic bundle should not include the shared code.  One exception is AOT for shared components.
The static bundle may only generate AOT output for what it uses.  The dynamic bundle may use additional generated AOT.
Since these per-directive AOT outputs are not easily separated between the static and dynamic, it is often simpler to live with some potential duplication.
A module loader like systemJS will simply ignore the second generated output.

#### Dynamic builds / hot module reloading in production.
With this approach you can rebuild the entire library of all static and dynamic modules with every change, then reload the modules user-side.
This approach allows you to produce more optimal builds with static analysis (i.e. webpack) at the cost of effectively reloading the user.
If your scenario uses dynamic components targeting specific tenants or audiences, it may be less optimal unless you produce separate builds for each target audience.

#### Raise community voice for minifiers to allow staged compilation.
Minifiers that are deterministic (always produce the same output) could be provided an input configuration representing the previous build.
Perhaps a better option would be to support importing mappings generated from a previous build, enabling incremental build scenarios.
Since the first stage would not know about the second stage it would lead to slightly larger packages than static analysis alone, but they would be much smaller than simple minification scenarios.
Google's closure compiler already has the ability to output mappings, but not yet to input them.
Lets hope bundling moves with the ES6 evolution towards dynamic modules.
