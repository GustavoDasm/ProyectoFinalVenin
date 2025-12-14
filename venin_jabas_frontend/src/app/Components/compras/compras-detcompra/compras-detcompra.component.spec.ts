import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasArticuloComponent } from './compras-detcompra.component';

describe('ComprasDetcompraComponent', () => {
  let component: ComprasArticuloComponent;
  let fixture: ComponentFixture<ComprasArticuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprasArticuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComprasArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
