import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Upload2Component } from './upload2.component';

describe('UploadComponent', () => {
  let component: Upload2Component;
  let fixture: ComponentFixture<Upload2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upload2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upload2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
