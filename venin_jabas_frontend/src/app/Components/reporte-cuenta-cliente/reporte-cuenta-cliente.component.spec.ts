import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCuentaClienteComponent } from './reporte-cuenta-cliente.component';

describe('ReporteCuentaClienteComponent', () => {
  let component: ReporteCuentaClienteComponent;
  let fixture: ComponentFixture<ReporteCuentaClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteCuentaClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteCuentaClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
