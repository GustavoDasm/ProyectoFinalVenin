import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaSalidaComponent } from './guia-salida.component';

describe('GuiaSalidaComponent', () => {
  let component: GuiaSalidaComponent;
  let fixture: ComponentFixture<GuiaSalidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuiaSalidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiaSalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
