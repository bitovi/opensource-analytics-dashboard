import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { CowComponent } from './components/cow/cow.component';
import { DataChartComponent } from './components/data-chart/data-chart.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';
import { ErrorHandlerDirective } from './directives';
import { ToObservablePipe } from './pipes';
import { ErrorInterceptorService } from './services/error-handler/error-interceptor.service';
import { FooterComponent } from './components/footer/footer.component';
import { SelectedLibrariesComponent } from './components/selected-libraries/selected-libraries.component';
import { SearchLibraryComponent } from './components/search-library/search-library.component';

@NgModule({
	declarations: [
		AppComponent,
		ToObservablePipe,
		ErrorHandlerDirective,
		CowComponent,
		DateRangePickerComponent,
		DataChartComponent,
  FooterComponent,
  SelectedLibrariesComponent,
  SearchLibraryComponent,
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
	providers: [{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true }],
	bootstrap: [AppComponent],
})
export class AppModule {}
