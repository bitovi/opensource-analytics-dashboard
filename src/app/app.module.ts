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
import { CowComponent } from './components/cow/cow.component';
import { ErrorHandlerDirective } from './directives';
import { ToObservablePipe } from './pipes';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
	declarations: [AppComponent, ToObservablePipe, ErrorHandlerDirective, CowComponent, FooterComponent],
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
