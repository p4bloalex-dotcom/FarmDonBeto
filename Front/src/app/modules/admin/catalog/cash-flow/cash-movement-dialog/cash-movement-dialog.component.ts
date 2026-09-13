import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'cash-movement-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './cash-movement-dialog.component.html'
})
export class CashMovementDialogComponent {
  dataForm: UntypedFormGroup;
  sessionId: number;
  movementTypes: any[] = [];
  isIncome: boolean;
  operationLabel: string;
  hasTypes: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<CashMovementDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.sessionId = _data?.sessionId;
    this.movementTypes = _data?.movementTypes ?? [];
    this.isIncome = _data?.type === 'income';
    this.operationLabel = this.isIncome ? 'Ingreso' : 'Egreso';
    this.hasTypes = this.movementTypes.length > 0;
  }

  ngOnInit(): void {
    this.dataForm = this._formBuilder.group({
      movementTypeId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    const { movementTypeId, amount, description } = this.dataForm.getRawValue();
    this._matDialogRef.close({
      idAction: 2,
      cashSessionId: this.sessionId,
      movementTypeId,
      amount: Number(amount),
      description: description?.trim() || null
    });
  }

  close(): void {
    this._matDialogRef.close();
  }
}