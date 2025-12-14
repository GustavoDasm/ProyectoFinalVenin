import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSucursalComponent } from './select-sucursal.component';

describe('SelectSucursalComponent', () => {
  let component: SelectSucursalComponent;
  let fixture: ComponentFixture<SelectSucursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectSucursalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
