import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';

import { GoogleChartsModule } from 'angular-google-charts';

import { ToObservablePipe } from './pipes';
import { ErrorHandlerDirective } from './directives';
import { AppComponent } from './app.component';
import { CowComponent } from './components/cow/cow.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    ToObservablePipe,
    ErrorHandlerDirective,
    CowComponent,
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
  bootstrap: [AppComponent]
})
export class AppModule { }
