import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGuiaSalidaComponent } from './add-guia-salida.component';

describe('AddGuiaSalidaComponent', () => {
  let component: AddGuiaSalidaComponent;
  let fixture: ComponentFixture<AddGuiaSalidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGuiaSalidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGuiaSalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
