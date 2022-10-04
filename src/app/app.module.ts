import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GoogleChartsModule } from 'angular-google-charts';

import { AppComponent } from './app.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { ChartComponent } from './components/chart/chart.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';
import { FooterComponent } from './components/footer/footer.component';
import { PackageListComponent } from './components/package-list/package-list.component';
import { ErrorHandlerDirective } from './directives';
import { ToObservablePipe } from './pipes';

@NgModule({
	declarations: [
		AppComponent,
		ToObservablePipe,
		ErrorHandlerDirective,
		FooterComponent,
		PackageListComponent,
		AutocompleteComponent,
		ChartComponent,
		DateRangePickerComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		HttpClientModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatInputModule,
		MatButtonModule,
		MatAutocompleteModule,
		MatListModule,
		MatIconModule,
		MatSnackBarModule,
		MatRippleModule,
		GoogleChartsModule.forRoot({ version: '51' }),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
