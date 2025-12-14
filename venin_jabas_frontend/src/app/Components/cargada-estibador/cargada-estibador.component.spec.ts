import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargadaEstibadorComponent } from './cargada-estibador.component';

describe('CargadaEstibadorComponent', () => {
  let component: CargadaEstibadorComponent;
  let fixture: ComponentFixture<CargadaEstibadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CargadaEstibadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargadaEstibadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
