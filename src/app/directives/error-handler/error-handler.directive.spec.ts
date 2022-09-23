import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { ErrorHandlerDirective } from './error-handler.directive';
import { NullishValidationErrors } from './error-handler.model';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'mat-error',
	template: '',
})
class MockMatErrorComponent {}

@Component({
	template: `<mat-error appErrorHandler [errors$]="errors$"></mat-error>`,
})
class HostComponent {
	errors$: Observable<NullishValidationErrors> = of(null);
}

describe('ErrorHandlerDirective', () => {
	let fixture: ComponentFixture<HostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MockMatErrorComponent, HostComponent, ErrorHandlerDirective],
		}).compileComponents();

		fixture = TestBed.createComponent(HostComponent);

		fixture.detectChanges(); // initial binding
	});

	it('should create an instance', () => {
		const directive = fixture.debugElement.query(By.directive(ErrorHandlerDirective));
		expect(directive).toBeTruthy();
	});
});
