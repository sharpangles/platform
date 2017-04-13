import { Directive, Input, OnChanges, SimpleChanges, Optional, Self } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, NgControl, FormGroupName, FormArrayName } from '@angular/forms';
import { SaStateOutlet } from './sa_state_outlet';


/**
 * Separates concerns of forms, allowing child components to build their control, while letting parents manage their membership and transactional behaviors.
 * WARNING: This uses a hack to replace the built-in form ngOnChanges method with a substitute.
 * Proposal: https://github.com/angular/angular/issues/10195
 */
@Directive({
    selector: '[saFormControl]'
})
export class SaFormControl implements OnChanges {
    constructor( @Optional() @Self() formGroupName: FormGroupName, @Optional() @Self() formArrayName: FormArrayName, @Optional() @Self() ngControl: NgControl) {
        this.otherDirective = <any>(formGroupName ? formGroupName : formArrayName ? formArrayName : ngControl);
        this.oldOnChanges = this.otherDirective.ngOnChanges;
        this.otherDirective.ngOnChanges = (changes: SimpleChanges) => this.newOnChanges(changes);
    }

    @Input() saFormControl: AbstractControl;

    /** The naming directive. */
    private otherDirective: any;

    /** The original ngOnChanges method that was overridden on the naming directive. */
    private oldOnChanges: (changes: SimpleChanges) => any;

    /** Holds onto changes that went to the original naming directive.  Undefined means it was never called, null means it is already handled. */
    private delayedChanges?: SimpleChanges;

    /** An ngOnChanges hack on the naming directive that delays its call until this ngOnChanges runs first.  Otherwise the naming directive will set up its control too soon. */
    private newOnChanges(changes: SimpleChanges) {
        if (!this.delayedChanges)
            this.delayedChanges = changes;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.saFormControl && this.otherDirective._parent) {
            if (changes.saFormControl.previousValue instanceof AbstractControl)
                this.remove();
            if (changes.saFormControl.currentValue instanceof AbstractControl)
                this.add();
            if (!(changes.saFormControl.previousValue instanceof AbstractControl) && !(changes.saFormControl.currentValue instanceof AbstractControl))
                return;
        }
        if (this.delayedChanges) {
            this.oldOnChanges.call(this.otherDirective, this.delayedChanges);
            delete this.delayedChanges;
        }
    }

    private add(): void {
        if (this.otherDirective._parent.control instanceof FormGroup)
            (<FormGroup>this.otherDirective._parent.control).addControl(this.otherDirective.name, this.saFormControl);
        else
            (<FormArray>this.otherDirective._parent.control).insert(parseInt(this.otherDirective.name), this.saFormControl);
    }

    private remove(): void {
        if (this.otherDirective._parent.control instanceof FormGroup)
            (<FormGroup>this.otherDirective._parent.control).removeControl(this.otherDirective.name);
        else
            (<FormArray>this.otherDirective._parent.control).removeAt(parseInt(this.otherDirective.name));
    }
}
