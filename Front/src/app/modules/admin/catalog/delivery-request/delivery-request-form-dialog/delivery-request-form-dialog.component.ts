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
  selector: 'app-delivery-request-form-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule, MatIconModule],
  templateUrl: './delivery-request-form-dialog.component.html',
  styleUrl: './delivery-request-form-dialog.component.scss'
})
export class DeliveryRequestFormDialogComponent implements OnInit {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  branches: any[] = [];
  medicines: any[] = [];
  isViewMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<DeliveryRequestFormDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.isViewMode = this.actionDialog === 7;
    this.dataForm = this._formBuilder.group({
      requestingBranchId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      fulfillmentBranchId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      customerName: [{ value: '', disabled: this.isViewMode }],
      customerContact: [{ value: '', disabled: this.isViewMode }],
      requestedAt: [{ value: this.toLocalInput(new Date()), disabled: this.isViewMode }, Validators.required],
      neededAt: [{ value: '', disabled: this.isViewMode }],
      notes: [{ value: '', disabled: this.isViewMode }],
      details: this._formBuilder.array([])
    });
    this.loadCombos();
    if (this._data?.row) this.loadRequest(this._data.row.id);
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

  loadRequest(id: number): void {
    this._generalApi.GetById('DeliveryRequest', id).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo cargar la solicitud.');
          return;
        }
        const request = resp.data;
        this.dataForm.patchValue({
          requestingBranchId: request.requestingBranchId,
          fulfillmentBranchId: request.fulfillmentBranchId,
          customerName: request.customerName ?? '',
          customerContact: request.customerContact ?? '',
          requestedAt: this.toLocalInput(request.requestedAt),
          neededAt: request.neededAt ? this.toLocalInput(request.neededAt) : '',
          notes: request.notes ?? ''
        });
        if (this.actionDialog === 2) {
          this.dataForm.get('requestingBranchId').disable();
          this.dataForm.get('fulfillmentBranchId').disable();
        }
        this.detailRows.clear();
        (request.details ?? []).forEach(detail => this.addDetailRow(detail));
      },
      error: () => this._toast.error('Error inesperado al cargar la solicitud.')
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
    if (costControl && Number(costControl.value ?? 0) === 0) {
      const medicine = this.medicines.find(item => item.id === medicineId);
      if (medicine) costControl.setValue(Number(medicine.priceBuy ?? 0));
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
      return { medicineId: Number(raw.medicineId), quantity: Number(raw.quantity), unitCost: Number(raw.unitCost) };
    });
    if (details.length === 0) {
      this._toast.error('Debe agregar al menos un medicamento.');
      return;
    }
    const payload = {
      requestingBranchId: Number(this.dataForm.get('requestingBranchId').value),
      fulfillmentBranchId: Number(this.dataForm.get('fulfillmentBranchId').value),
      customerName: this.dataForm.get('customerName').value?.trim() || null,
      customerContact: this.dataForm.get('customerContact').value?.trim() || null,
      requestedAt: this.dataForm.get('requestedAt').value,
      neededAt: this.dataForm.get('neededAt').value || null,
      notes: this.dataForm.get('notes').value?.trim() || null,
      details
    };
    const request = this.actionDialog === 2 ? this._generalApi.modify('DeliveryRequest', this._data.row.id, payload) : this._generalApi.add('DeliveryRequest', payload);
    request.subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this._matDialogRef.close({ idAction: this.actionDialog, ...resp.data }) : this._toast.error(resp.error?.detail ?? 'No se pudo guardar la solicitud.'),
      error: () => this._toast.error('Error inesperado al guardar la solicitud.')
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
