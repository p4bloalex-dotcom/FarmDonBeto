import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'cash-close-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './cash-close-dialog.component.html'
})
export class CashCloseDialogComponent {
  dataForm: UntypedFormGroup;
  expectedAmount: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<CashCloseDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.expectedAmount = Number(_data?.expectedAmount ?? 0);
  }

  ngOnInit(): void {
    this.dataForm = this._formBuilder.group({
      closingAmount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    const { closingAmount } = this.dataForm.getRawValue();
    this._matDialogRef.close({
      idAction: 3,
      closingAmount: Math.max(Number(closingAmount) || 0, 0)
    });
  }

  get difference(): number {
    const value = this.dataForm?.get('closingAmount')?.value;
    const counted = Number(value);
    return isNaN(counted) ? this.expectedAmount * -1 : counted - this.expectedAmount;
  }

  close(): void {
    this._matDialogRef.close();
  }
}