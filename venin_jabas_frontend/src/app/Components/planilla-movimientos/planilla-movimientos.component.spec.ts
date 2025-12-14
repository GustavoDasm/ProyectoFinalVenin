import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaMovimientosComponent } from './planilla-movimientos.component';

describe('PlanillaMovimientosComponent', () => {
  let component: PlanillaMovimientosComponent;
  let fixture: ComponentFixture<PlanillaMovimientosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanillaMovimientosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanillaMovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
