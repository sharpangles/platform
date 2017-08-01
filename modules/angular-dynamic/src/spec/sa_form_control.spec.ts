import { Component, Input, forwardRef, ViewChild, ViewChildren, QueryList, ElementRef, Renderer2, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormArray, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { TestBed, async } from '@angular/core/testing';
import { StatefulModule } from '../src/stateful_module';

@Component({
    selector: 'child',
    template: `<input #inputElement type="text" [formControl]="control" [(ngModel)]="value" required />`,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChildControl), multi: true }]
})
export class ChildControl implements ControlValueAccessor {
    constructor(private _renderer: Renderer2) {
    }

    @ViewChild('inputElement') private _inputElement: ElementRef;

    onChange = (_: any) => { };
    onTouched = () => { };

    writeValue(obj: any): void {
        this._renderer.setProperty(this._inputElement.nativeElement, 'value', obj);
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    control = new FormControl();
    @Input() value: string;
}

@Component({
    selector: 'test-cmp',
    template: `
<form [formGroup]="control" (submit)="submit($event)">
    <p formArrayName="list"><child *ngFor="let child of childValues; let i = index" [value]="child" #comp [formControlName]="i" [saFormControl]="comp.control"></child></p>
</form>
`
})
export class TestComponent {
    @ViewChildren(ChildControl) children: QueryList<ChildControl>;

    childValues: any = ['hi', 'whatever'];

    control: FormGroup = new FormGroup({
        list: new FormArray([])
    });

    submit(event: Event) {
        console.log(this.control.value);
        console.log(this.control.valid);
        event.preventDefault();
    }
}

@NgModule({
    declarations: [ChildControl, TestComponent],
    imports: [StatefulModule, CommonModule],
    exports: [StatefulModule, CommonModule, ChildControl, TestComponent],
    entryComponents: [TestComponent]
})
export class TestModule {
}

describe('SaFormControl', () => {
    let moduleConfig = {
        imports: [TestModule]
    };
    beforeEach(async(async () => {
        TestBed.configureTestingModule(moduleConfig);
        await TestBed.compileComponents();
    }));
    it('should connect an explicit child control to a parent', async(async () => {
        let fixture = TestBed.createComponent(TestComponent);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();
        let testComponent = <TestComponent>fixture.componentInstance;
        expect(testComponent.children.length).toBeTruthy();
    }));
});
