import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-stock-transfer-form-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule, MatIconModule],
  templateUrl: './stock-transfer-form-dialog.component.html',
  styleUrl: './stock-transfer-form-dialog.component.scss'
})
export class StockTransferFormDialogComponent implements OnInit {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  branches: any[] = [];
  medicines: any[] = [];
  isViewMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<StockTransferFormDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.isViewMode = this.actionDialog === 7;

    this.dataForm = this._formBuilder.group({
      branchOriginId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      branchDestinationId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      movementDate: [{ value: this.toLocalInput(new Date()), disabled: this.isViewMode }, Validators.required],
      description: [{ value: '', disabled: this.isViewMode }],
      details: this._formBuilder.array([])
    });

    this.loadCombos();
    if (this._data?.row) {
      this.loadTransfer(this._data.row.id);
    }
  }

  get detailRows(): FormArray {
    return this.dataForm.get('details') as FormArray;
  }

  loadCombos(): void {
    this._generalApi.comboList(['Branch', 'Medicine']).subscribe({
      next: ([branches, medicines]) => {
        this.branches = branches;
        this.medicines = medicines;
      },
      error: () => this._toast.error('Error inesperado al cargar los catalogos.')
    });
  }

  loadTransfer(id: number): void {
    this._generalApi.GetById('StockTransfer', id).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo cargar el traspaso.');
          return;
        }
        const transfer = resp.data;
        const details = Array.isArray(transfer.details) ? transfer.details : [];

        this.dataForm.patchValue({
          branchOriginId: transfer.branchOriginId,
          branchDestinationId: transfer.branchDestinationId,
          movementDate: this.toLocalInput(transfer.movementDate),
          description: transfer.description ?? ''
        });

        if (this.actionDialog === 2) {
          this.dataForm.get('branchOriginId').disable();
          this.dataForm.get('branchDestinationId').disable();
        }

        this.detailRows.clear();
        details.forEach(detail => this.addDetailRow(detail));
      },
      error: () => this._toast.error('Error inesperado al cargar el traspaso.')
    });
  }

  addDetailRow(row: any = null): void {
    const group = this._formBuilder.group({
      medicineId: [{ value: row?.medicineId ?? '', disabled: this.isViewMode }, Validators.required],
      quantity: [{ value: row?.quantity ?? 1, disabled: this.isViewMode }, [Validators.required, Validators.min(0.001)]],
      unitCost: [{ value: row?.unitCost ?? 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]]
    });

    const control = group.get('medicineId');
    control.valueChanges.subscribe(medicineId => this.onMedicineChange(group, medicineId));

    this.detailRows.push(group);
  }

  onMedicineChange(group: UntypedFormGroup, medicineId: number): void {
    const costControl = group.get('unitCost');
    if (costControl && (costControl.value === null || costControl.value === '' || Number(costControl.value) === 0)) {
      const medicine = this.medicines.find(item => item.id === medicineId);
      if (medicine) {
        costControl.setValue(Number(medicine.priceBuy ?? 0));
      }
    }
  }

  removeDetailRow(index: number): void {
    this.detailRows.removeAt(index);
  }

  save(): void {
    if (this.dataForm.invalid) {
      this._toast.error('Complete los campos obligatorios y agregue al menos un medicamento.');
      return;
    }

    const details = this.detailRows.controls.map(group => {
      const raw = group.getRawValue();
      return {
        medicineId: Number(raw.medicineId),
        quantity: Number(raw.quantity),
        unitCost: Number(raw.unitCost)
      };
    });

    if (details.length === 0) {
      this._toast.error('Debe agregar al menos un medicamento al traspaso.');
      return;
    }

    const payload = {
      branchOriginId: Number(this.dataForm.get('branchOriginId').value),
      branchDestinationId: Number(this.dataForm.get('branchDestinationId').value),
      movementDate: this.dataForm.get('movementDate').value,
      description: this.dataForm.get('description').value?.trim() || null,
      details
    };

    const request = this.actionDialog === 2
      ? this._generalApi.modify('StockTransfer', this._data.row.id, payload)
      : this._generalApi.add('StockTransfer', payload);

    request.subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this._matDialogRef.close({ idAction: this.actionDialog, ...resp.data });
        } else {
          this._toast.error(resp.error?.detail ?? 'No se pudo guardar el traspaso.');
        }
      },
      error: () => this._toast.error('Error inesperado al guardar el traspaso.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }

  private toLocalInput(value: any): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }
}