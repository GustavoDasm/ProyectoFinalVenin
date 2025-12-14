import { TestBed } from '@angular/core/testing';

import { NubefactService } from './nubefact.service';

describe('NubefactService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NubefactService = TestBed.get(NubefactService);
    expect(service).toBeTruthy();
  });
});
