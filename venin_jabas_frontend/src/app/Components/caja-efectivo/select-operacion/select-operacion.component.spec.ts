import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOperacionComponent } from './select-operacion.component';

describe('SelectOperacionComponent', () => {
  let component: SelectOperacionComponent;
  let fixture: ComponentFixture<SelectOperacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectOperacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOperacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
