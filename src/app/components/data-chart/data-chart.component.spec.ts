import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataChartComponent } from './data-chart.component';

describe('DataChartComponent', () => {
  let component: DataChartComponent;
  let fixture: ComponentFixture<DataChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
