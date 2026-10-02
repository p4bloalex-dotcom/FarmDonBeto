import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-fixed-asset-retire-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './fixed-asset-retire-dialog.component.html'
})
export class FixedAssetRetireDialogComponent implements OnInit {
  dataForm: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _matDialogRef: MatDialogRef<FixedAssetRetireDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.dataForm = this._formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    this._matDialogRef.close(this.dataForm.getRawValue());
  }

  useReason(reason: string): void {
    this.dataForm.get('reason')?.setValue(reason);
  }

  close(): void {
    this._matDialogRef.close();
  }
}
