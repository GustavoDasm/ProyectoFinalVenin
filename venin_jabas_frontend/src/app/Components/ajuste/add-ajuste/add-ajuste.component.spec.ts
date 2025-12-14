import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAjusteComponent } from './add-ajuste.component';

describe('AddAjusteComponent', () => {
  let component: AddAjusteComponent;
  let fixture: ComponentFixture<AddAjusteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAjusteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
