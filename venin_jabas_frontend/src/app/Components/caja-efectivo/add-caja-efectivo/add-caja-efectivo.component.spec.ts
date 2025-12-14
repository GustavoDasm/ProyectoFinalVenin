import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCajaEfectivoComponent } from './add-caja-efectivo.component';

describe('AddCajaEfectivoComponent', () => {
  let component: AddCajaEfectivoComponent;
  let fixture: ComponentFixture<AddCajaEfectivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCajaEfectivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCajaEfectivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
