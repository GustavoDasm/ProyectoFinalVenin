import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePorTipoComponent } from './reporte-por-tipo.component';

describe('ReportePorTipoComponent', () => {
  let component: ReportePorTipoComponent;
  let fixture: ComponentFixture<ReportePorTipoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportePorTipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportePorTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
