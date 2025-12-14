import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEjemploComponent } from './form-ejemplo.component';

describe('FormEjemploComponent', () => {
  let component: FormEjemploComponent;
  let fixture: ComponentFixture<FormEjemploComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormEjemploComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormEjemploComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
