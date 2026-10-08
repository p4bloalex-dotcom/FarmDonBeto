import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-inventory-lot-sanitary-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './inventory-lot-sanitary-dialog.component.html'
})
export class InventoryLotSanitaryDialogComponent implements OnInit {
  dataForm: UntypedFormGroup;
  statusOptions = [
    { value: 'APPROVED', label: 'Apto para venta' },
    { value: 'IMMOBILIZED', label: 'Inmovilizado' },
    { value: 'QUARANTINE', label: 'Cuarentena' },
    { value: 'REJECTED', label: 'No apto' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _matDialogRef: MatDialogRef<InventoryLotSanitaryDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    const lot = this.data.lot;
    this.dataForm = this._formBuilder.group({
      sanitaryStatus: [lot.sanitaryStatus ?? 'APPROVED', [Validators.required]],
      sanitaryBlockReason: [lot.sanitaryBlockReason ?? ''],
      sanitaryRegistrationVerified: [false],
      lotMatchesDocument: [false],
      expirationValid: [false],
      packageIntegrityOk: [false],
      storageConditionOk: [false]
    });
    this.applyReasonValidation(this.dataForm.value.sanitaryStatus);
    this.dataForm.get('sanitaryStatus').valueChanges.subscribe(status => this.applyReasonValidation(status));
  }

  save(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    const payload = this.dataForm.getRawValue();
    const checks = ['sanitaryRegistrationVerified', 'lotMatchesDocument', 'expirationValid', 'packageIntegrityOk', 'storageConditionOk'];
    if (payload.sanitaryStatus === 'APPROVED' && checks.some(key => payload[key] !== true)) {
      this.dataForm.setErrors({ checklist: true });
      return;
    }
    payload.qualityChecks = Object.fromEntries(checks.map(key => [key, payload[key]]));
    if (payload.sanitaryStatus === 'APPROVED') payload.sanitaryBlockReason = null;
    this._matDialogRef.close(payload);
  }

  close(): void {
    this._matDialogRef.close();
  }

  private applyReasonValidation(status: string): void {
    const reason = this.dataForm.get('sanitaryBlockReason');
    if (status === 'APPROVED') {
      reason.clearValidators();
      reason.setValue('', { emitEvent: false });
    } else {
      reason.setValidators([Validators.required, Validators.maxLength(500)]);
    }
    reason.updateValueAndValidity({ emitEvent: false });
  }
}
