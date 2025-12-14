import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaEfectivoComponent } from './caja-efectivo.component';

describe('CajaEfectivoComponent', () => {
  let component: CajaEfectivoComponent;
  let fixture: ComponentFixture<CajaEfectivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CajaEfectivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CajaEfectivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
