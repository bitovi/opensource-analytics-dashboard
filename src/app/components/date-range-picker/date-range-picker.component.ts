import { Component, forwardRef, inject } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { startOfDay, subDays } from 'date-fns';
import { Subject, takeUntil, tap } from 'rxjs';
import { ErrorHandlerService } from 'src/app/services';

// TODO: rename to DateRangePickerValue
export type Value = [Date | null, Date | null];

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
})
export class DateRangePickerComponent implements ControlValueAccessor, Validators {
  private readonly unsubscribe$ = new Subject<void>();

  formGroup = this.getDateRangeFormGroup();

  // How do we feel about keeping this as just a property?
  // Should it be migrated to a consts file?
  readonly minDate = new Date(2015, 0, 1);
  readonly maxDate = new Date();

  private readonly errorHandlerService = inject(ErrorHandlerService);

  readonly startDateErrorsHandler =
  this.errorHandlerService.getDatepickerErrorsHandler('Start Date');
readonly endDateErrorsHandler =
  this.errorHandlerService.getDatepickerErrorsHandler('End Date');

  getDateRangeFormGroup(): FormGroup<{
    start: FormControl<Date | null>;
    end: FormControl<Date | null>;
  }> {
    const currentDate = startOfDay(new Date());

    return new FormGroup({
      start: new FormControl<Date | null>(subDays(currentDate, 8), {
        validators: Validators.required,
        // nonNullable: true,
      }),
      end: new FormControl<Date | null>(subDays(currentDate, 1), {
        validators: Validators.required,
        // nonNullable: true,
      }),
    });
  }

  constructor() {
    this.formGroup.valueChanges.pipe(
      tap((dates) => {
        const start = this.formGroup.controls.start.valid ? dates.start ?? null : null;
        const end = this.formGroup.controls.end.valid ? dates.end ?? null : null;

        this.onChange([start, end]);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe();
  }

  onBlur(event?: Event): void {
    console.log(event);
    this.onTouched();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (value: Value) => {/* empty */};
  onTouched = () => {console.log('touched')};

  writeValue([start, end]: Value): void {
    this.formGroup.controls.start.setValue(start);
    this.formGroup.controls.end.setValue(end);
  }
  // TODO: have abetter type for this than any
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  // setDisabledState?(isDisabled: boolean): void {
  setDisabledState?(): void {
    throw new Error('Method not implemented.');
  }

  // Normally validators have an AbstractControl as an argument
  // Silencing lint error, but in production, we should just remove (keeping it here as notes)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  matDateRangePickerValidators = (c: AbstractControl): ValidationErrors | null => {
    // Carry MatDateRangePicker errors to this Component's errors
    const nestedErrors = this.formGroup.errors ?? this.formGroup.controls.start.errors ?? this.formGroup.controls.end.errors;

    if (nestedErrors) {
      return nestedErrors;
    }
    
    return null;
  }

  _validator: ValidatorFn | null = Validators.compose([this.matDateRangePickerValidators]);

  validate(c: AbstractControl): ValidationErrors | null {
    // How to compose multiple validators
    // return Validators.compose([this.matDateRangePickerValidators]);
    return this.matDateRangePickerValidators(c);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
