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
  readonly differenceTolerance = 5;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<CashCloseDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.expectedAmount = Number(_data?.expectedAmount ?? 0);
  }

  ngOnInit(): void {
    this.dataForm = this._formBuilder.group({
      closingAmount: ['', [Validators.required, Validators.min(0)]],
      differenceExplanation: [''],
      q100: [0, [Validators.min(0)]],
      q50: [0, [Validators.min(0)]],
      q20: [0, [Validators.min(0)]],
      q10: [0, [Validators.min(0)]],
      q5: [0, [Validators.min(0)]],
      q1: [0, [Validators.min(0)]]
    }, { validators: [this.breakdownMatchesClosingAmount.bind(this), this.differenceExplanationRequired.bind(this)] });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    const { closingAmount, differenceExplanation, q100, q50, q20, q10, q5, q1 } = this.dataForm.getRawValue();
    this._matDialogRef.close({
      idAction: 3,
      closingAmount: Math.max(Number(closingAmount) || 0, 0),
      differenceExplanation,
      countedBreakdown: { q100, q50, q20, q10, q5, q1 }
    });
  }

  get difference(): number {
    const value = this.dataForm?.get('closingAmount')?.value;
    const counted = Number(value);
    return isNaN(counted) ? this.expectedAmount * -1 : counted - this.expectedAmount;
  }

  get breakdownTotal(): number {
    if (!this.dataForm) return 0;
    const { q100, q50, q20, q10, q5, q1 } = this.dataForm.getRawValue();
    return (Number(q100) || 0) * 100 + (Number(q50) || 0) * 50 + (Number(q20) || 0) * 20 + (Number(q10) || 0) * 10 + (Number(q5) || 0) * 5 + (Number(q1) || 0);
  }

  private breakdownMatchesClosingAmount(form: UntypedFormGroup): { breakdownMismatch: true } | null {
    const closingAmount = Number(form.get('closingAmount')?.value);
    if (isNaN(closingAmount)) return null;
    const { q100, q50, q20, q10, q5, q1 } = form.getRawValue();
    const total = (Number(q100) || 0) * 100 + (Number(q50) || 0) * 50 + (Number(q20) || 0) * 20 + (Number(q10) || 0) * 10 + (Number(q5) || 0) * 5 + (Number(q1) || 0);
    return Math.abs(total - closingAmount) > 0.009 ? { breakdownMismatch: true } : null;
  }

  private differenceExplanationRequired(form: UntypedFormGroup): { differenceExplanationRequired: true } | null {
    const closingAmount = Number(form.get('closingAmount')?.value);
    if (isNaN(closingAmount)) return null;
    const explanation = String(form.get('differenceExplanation')?.value ?? '').trim();
    return Math.abs(closingAmount - this.expectedAmount) > this.differenceTolerance && !explanation ? { differenceExplanationRequired: true } : null;
  }

  close(): void {
    this._matDialogRef.close();
  }
}
