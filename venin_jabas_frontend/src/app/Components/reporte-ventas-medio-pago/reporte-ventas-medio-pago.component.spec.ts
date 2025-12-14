import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVentasMedioPagoComponent } from './reporte-ventas-medio-pago.component';

describe('ReporteVentasMedioPagoComponent', () => {
  let component: ReporteVentasMedioPagoComponent;
  let fixture: ComponentFixture<ReporteVentasMedioPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteVentasMedioPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteVentasMedioPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
