import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { ToObservablePipe } from './pipes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        // MockMatComponent,
        AppComponent,
        ToObservablePipe,
        MatAutocomplete// Required for #auto="matAutocomplete" directive
      ],
      providers: [
        {
          provide: MatSnackBar,
          useValue: {
            open: () => {/** stub */},
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
