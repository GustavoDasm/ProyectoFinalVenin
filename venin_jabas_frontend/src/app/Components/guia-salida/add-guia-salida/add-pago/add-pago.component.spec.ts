import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPagoComponent } from './add-pago.component';

describe('AddPagoComponent', () => {
  let component: AddPagoComponent;
  let fixture: ComponentFixture<AddPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
