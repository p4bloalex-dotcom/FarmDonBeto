import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'cash-open-dialog',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './cash-open-dialog.component.html'
})
export class CashOpenDialogComponent {
  dataForm: UntypedFormGroup = this._formBuilder.group({
    cashRegisterId: ['', Validators.required],
    openingAmount: [0, [Validators.required, Validators.min(0)]]
  });
  registers: any[] = [];
  registerName = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<CashOpenDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.registers = _data?.registers ?? [];
  }

  ngOnInit(): void {
    const defaultRegister = this.registers.find((register) => register.id === this._data?.selectedRegisterId) ?? this.registers[0];
    this.registerName = this.registers.length === 1 ? defaultRegister?.name ?? '' : '';
    this.dataForm.patchValue({
      cashRegisterId: defaultRegister?.id ?? '',
      openingAmount: 0
    });
  }

  get canOpenCash(): boolean {
    return this.registers.length > 0 && this.dataForm.valid;
  }

  save(): void {
    if (!this.canOpenCash) return;
    const { cashRegisterId, openingAmount } = this.dataForm.getRawValue();
    this._matDialogRef.close({
      idAction: 1,
      cashRegisterId,
      openingAmount: Math.max(Number(openingAmount) || 0, 0)
    });
  }

  close(): void {
    this._matDialogRef.close();
  }
}
