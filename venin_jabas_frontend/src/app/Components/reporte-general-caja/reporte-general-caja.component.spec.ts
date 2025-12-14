import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteGeneralCajaComponent } from './reporte-general-caja.component';

describe('ReporteGeneralCajaComponent', () => {
  let component: ReporteGeneralCajaComponent;
  let fixture: ComponentFixture<ReporteGeneralCajaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteGeneralCajaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteGeneralCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
