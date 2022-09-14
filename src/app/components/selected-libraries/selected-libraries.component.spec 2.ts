import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedLibrariesComponent } from './selected-libraries.component';

describe('SelectedLibrariesComponent', () => {
  let component: SelectedLibrariesComponent;
  let fixture: ComponentFixture<SelectedLibrariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedLibrariesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedLibrariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
