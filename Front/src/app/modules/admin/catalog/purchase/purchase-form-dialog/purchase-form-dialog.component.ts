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
  selector: 'app-purchase-form-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule, MatIconModule],
  templateUrl: './purchase-form-dialog.component.html',
  styleUrl: './purchase-form-dialog.component.scss'
})
export class PurchaseFormDialogComponent implements OnInit {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  suppliers: any[] = [];
  branches: any[] = [];
  medicines: any[] = [];
  isViewMode = false;
  subtotal = 0;
  tax = 0;
  total = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<PurchaseFormDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.isViewMode = this.actionDialog === 7;

    this.dataForm = this._formBuilder.group({
      supplierId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      branchId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      invoiceNumber: [{ value: '', disabled: this.isViewMode }, Validators.required],
      purchaseDate: [{ value: this.toLocalInput(new Date()), disabled: this.isViewMode }, Validators.required],
      taxRate: [{ value: 12, disabled: this.isViewMode }, [Validators.required, Validators.min(0), Validators.max(100)]],
      details: this._formBuilder.array([])
    });

    this.loadCombos();
    if (this._data?.row) {
      this.loadPurchase(this._data.row.id);
    }
  }

  get detailRows(): FormArray {
    return this.dataForm.get('details') as FormArray;
  }

  loadCombos(): void {
    this._generalApi.comboList(['Supplier', 'Branch', 'Medicine']).subscribe({
      next: ([suppliers, branches, medicines]) => {
        this.suppliers = suppliers;
        this.branches = (branches ?? []).filter(item => Number(item.isMain ?? item.is_main) === 1);
        this.medicines = medicines;
        if (this.actionDialog === 1 && this.branches.length === 1) {
          this.dataForm.get('branchId').patchValue(this.branches[0].id);
        }
      },
      error: () => this._toast.error('Error inesperado al cargar los catalogos.')
    });
  }

  loadPurchase(id: number): void {
    this._generalApi.GetById('Purchase', id).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo cargar la compra.');
          return;
        }
        const purchase = resp.data;
        const details = Array.isArray(purchase.details) ? purchase.details : [];
        const subtotal = Number(purchase.subtotal ?? 0);
        const tax = Number(purchase.tax ?? 0);

        this.dataForm.patchValue({
          supplierId: purchase.supplierId,
          branchId: purchase.branchId,
          invoiceNumber: purchase.invoiceNumber,
          purchaseDate: this.toLocalInput(purchase.purchaseDate),
          taxRate: subtotal > 0 ? Math.round((tax / subtotal) * 1000) / 10 : 0
        });

        if (this.actionDialog === 2) {
          this.dataForm.get('branchId').disable();
        }

        this.detailRows.clear();
        details.forEach(detail => this.addDetailRow(detail));

        if (this.actionDialog !== 7) {
          this.recalculate();
        } else {
          this.subtotal = subtotal;
          this.tax = tax;
          this.total = subtotal + tax;
        }
      },
      error: () => this._toast.error('Error inesperado al cargar la compra.')
    });
  }

  addDetailRow(row: any = null): void {
    const group = this._formBuilder.group({
      medicineId: [{ value: row?.medicineId ?? '', disabled: this.isViewMode }, Validators.required],
      quantity: [{ value: row?.quantity ?? 1, disabled: this.isViewMode }, [Validators.required, Validators.min(0.001)]],
      unitPrice: [{ value: row?.unitPrice ?? 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      lotNumber: [{ value: row?.lotNumber ?? '', disabled: this.isViewMode }],
      expirationDate: [{ value: row?.expirationDate ? this.toDateInput(row.expirationDate) : '', disabled: this.isViewMode }]
    });

    const control = group.get('medicineId');
    control.valueChanges.subscribe(medicineId => this.onMedicineChange(group, medicineId));

    this.detailRows.push(group);
  }

  onMedicineChange(group: UntypedFormGroup, medicineId: number): void {
    const priceControl = group.get('unitPrice');
    if (priceControl && (priceControl.value === null || priceControl.value === '' || Number(priceControl.value) === 0)) {
      const medicine = this.medicines.find(item => item.id === medicineId);
      if (medicine) {
        priceControl.setValue(Number(medicine.priceBuy ?? 0));
      }
    }
  }

  removeDetailRow(index: number): void {
    this.detailRows.removeAt(index);
    this.recalculate();
  }

  recalculate(): void {
    const details = this.detailRows.controls.map(group => group.getRawValue());
    this.subtotal = details.reduce((acc, detail) => acc + Number(detail.quantity ?? 0) * Number(detail.unitPrice ?? 0), 0);
    const rate = Number(this.dataForm.get('taxRate')?.value ?? 0);
    this.tax = this.subtotal * (rate / 100);
    this.total = this.subtotal + this.tax;
  }

  save(): void {
    if (this.dataForm.invalid) {
      this._toast.error('Complete los campos obligatorios y agregue al menos un medicamento.');
      return;
    }
    this.recalculate();

    const details = this.detailRows.controls.map(group => {
      const raw = group.getRawValue();
      return {
        medicineId: Number(raw.medicineId),
        quantity: Number(raw.quantity),
        unitPrice: Number(raw.unitPrice),
        lotNumber: raw.lotNumber || null,
        expirationDate: raw.expirationDate || null
      };
    });

    if (details.length === 0) {
      this._toast.error('Debe agregar al menos un medicamento a la compra.');
      return;
    }

    const payload = {
      supplierId: Number(this.dataForm.get('supplierId').value),
      branchId: Number(this.dataForm.get('branchId').value),
      invoiceNumber: this.dataForm.get('invoiceNumber').value?.trim(),
      purchaseDate: this.dataForm.get('purchaseDate').value,
      tax: Math.round(this.tax * 100) / 100,
      details
    };

    const request = this.actionDialog === 2
      ? this._generalApi.modify('Purchase', this._data.row.id, payload)
      : this._generalApi.add('Purchase', payload);

    request.subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this._matDialogRef.close({ idAction: this.actionDialog, ...resp.data });
        } else {
          this._toast.error(resp.error?.detail ?? 'No se pudo guardar la compra.');
        }
      },
      error: () => this._toast.error('Error inesperado al guardar la compra.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }

  medicineLabel(item: any): string {
    return item ? `${item.name}` : '';
  }

  private toLocalInput(value: any): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  private toDateInput(value: any): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }
}
