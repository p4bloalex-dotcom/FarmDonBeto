import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadfileDialogComponent } from './uploadfile-dialog.component';

describe('UploadfileDialogComponent', () => {
  let component: UploadfileDialogComponent;
  let fixture: ComponentFixture<UploadfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadfileDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
