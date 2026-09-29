import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
  filteredMedicines: any[] = [];
  supplierMedicines: any[] = [];
  medicineSearchControl = new UntypedFormControl('');
  isViewMode = false;
  subtotal = 0;
  tax = 0;
  total = 0;
  purchase: any = null;
  private isLoadingPurchase = false;

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
    this.medicineSearchControl.valueChanges.subscribe(searchText => this.filterMedicines(searchText));
    this.dataForm.get('supplierId').valueChanges.subscribe(() => this.onSupplierChanged());
    if (this._data?.row) {
      this.loadPurchase(this._data.row.id);
    }
  }

  get detailRows(): FormArray {
    return this.dataForm.get('details') as FormArray;
  }

  loadCombos(): void {
    this._generalApi.comboList(['Supplier', 'Branch', 'Medicine', 'SupplierMedicine']).subscribe({
      next: ([suppliers, branches, medicines, supplierMedicines]) => {
        this.suppliers = suppliers;
        this.branches = this.actionDialog === 1 ? (branches ?? []).filter(item => Number(item.isMain ?? item.is_main) === 1) : (branches ?? []);
        this.medicines = medicines;
        this.supplierMedicines = supplierMedicines ?? [];
        this.filterMedicines(this.medicineSearchControl.value);
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
        this.purchase = purchase;
        const details = Array.isArray(purchase.details) ? purchase.details : [];
        const subtotal = Number(purchase.subtotal ?? 0);
        const tax = Number(purchase.tax ?? 0);

        this.isLoadingPurchase = true;
        this.dataForm.patchValue({
          supplierId: purchase.supplierId,
          branchId: purchase.branchId,
          invoiceNumber: purchase.supplierInvoice?.invoiceNumber ?? purchase.invoiceNumber,
          purchaseDate: this.toLocalInput(purchase.purchaseDate),
          taxRate: subtotal > 0 ? Math.round((tax / subtotal) * 1000) / 10 : 0
        }, { emitEvent: false });
        this.filterMedicines(this.medicineSearchControl.value);

        if (this.actionDialog === 2) {
          this.dataForm.get('branchId').disable();
        }

        this.detailRows.clear();
        details.forEach(detail => this.addDetailRow(detail));
        this.isLoadingPurchase = false;

        if (this.actionDialog !== 7) {
          this.recalculate();
        } else {
          this.subtotal = subtotal;
          this.tax = tax;
          this.total = Number(purchase.supplierInvoice?.total ?? subtotal + tax);
        }
      },
      error: () => this._toast.error('Error inesperado al cargar la compra.')
    });
  }

  addDetailRow(row: any = null): void {
    if (!this.dataForm.get('supplierId')?.value && !this.isViewMode) {
      this._toast.error('Seleccione un proveedor antes de agregar medicamentos.');
      return;
    }
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
    return item ? [item.code, item.name].filter(Boolean).join(' - ') : '';
  }

  money(value: any): string {
    return `Q ${Number(value ?? 0).toFixed(2)}`;
  }

  supplierName(): string {
    const id = this.dataForm?.get('supplierId')?.value;
    return this.suppliers.find(item => item.id === id)?.name ?? this._data?.row?.supplierName ?? '-';
  }

  branchName(): string {
    const id = this.dataForm?.get('branchId')?.value;
    return this.branches.find(item => item.id === id)?.name ?? this._data?.row?.branchName ?? '-';
  }

  medicineName(row: any): string {
    const id = row?.get('medicineId')?.value;
    return this.medicineLabel(this.medicines.find(item => item.id === id)) || '-';
  }

  rowSubtotal(row: any): number {
    return Number(row?.get('quantity')?.value ?? 0) * Number(row?.get('unitPrice')?.value ?? 0);
  }

  onSupplierChanged(): void {
    if (this.isViewMode || this.isLoadingPurchase) return;
    this.detailRows.clear();
    this.recalculate();
    this.filterMedicines(this.medicineSearchControl.value);
  }

  hasSupplierMedicines(): boolean {
    return !this.dataForm?.get('supplierId')?.value || this.filteredMedicines.length > 0;
  }

  statusLabel(): string {
    const labels: Record<string, string> = {
      E: 'Registrada',
      DRAFT: 'Borrador',
      PENDING_APPROVAL: 'Pendiente aprobacion',
      APPROVED: 'Aprobada',
      PARTIALLY_RECEIVED: 'Recepcion parcial',
      RECEIVED: 'Recibida',
      INVOICED: 'Facturada',
      DISCREPANCY: 'Con discrepancia'
    };
    return labels[this._data?.row?.status] ?? this._data?.row?.status ?? '-';
  }

  orderedTotal(): number {
    return this.detailRows.controls.reduce((sum, row) => sum + Number(row.get('quantity')?.value ?? 0) * Number(row.get('unitPrice')?.value ?? 0), 0);
  }

  payableTotal(): number {
    const details = this.purchase?.details ?? [];
    if (!details.length) return this.orderedTotal();
    return details.reduce((sum, detail) => {
      const verified = Number(detail.quantityReceived ?? 0);
      const rejected = Number(detail.quantityRejected ?? 0);
      return sum + Math.max(0, verified - rejected) * Number(detail.unitPrice ?? 0);
    }, 0);
  }

  notAcceptedTotal(): number {
    const details = this.purchase?.details ?? [];
    return details.reduce((sum, detail) => sum + Number(detail.quantityRejected ?? 0) * Number(detail.unitPrice ?? 0), 0);
  }

  pendingTotal(): number {
    const details = this.purchase?.details ?? [];
    return details.reduce((sum, detail) => sum + Number(detail.quantityPending ?? 0) * Number(detail.unitPrice ?? 0), 0);
  }

  invoiceTotal(): number {
    return Number(this.purchase?.supplierInvoice?.total ?? this.total ?? 0);
  }

  discrepancyMessage(): string {
    if (this.purchase?.status !== 'DISCREPANCY') return '';
    const difference = Math.round((this.invoiceTotal() - this.payableTotal()) * 100) / 100;
    if (difference > 0) return `La factura es mayor a lo pagable por ${this.money(difference)}. Revise producto no aceptado o solicite nota de credito/correccion.`;
    if (difference < 0) return `La factura es menor a lo recibido en buen estado por ${this.money(Math.abs(difference))}. Revise descuentos, bonificaciones o factura incompleta.`;
    return 'La compra esta marcada con discrepancia. Revise la factura registrada y las cantidades recibidas.';
  }

  private filterMedicines(searchText: string = ''): void {
    const text = (searchText ?? '').toString().trim().toLowerCase();
    const supplierId = Number(this.dataForm?.get('supplierId')?.value ?? 0);
    const source = supplierId
      ? this.medicines.filter(item => this.supplierMedicines.some(relation => Number(relation.supplierId ?? relation.supplier_id) === supplierId && Number(relation.medicineId ?? relation.medicine_id) === Number(item.id)))
      : [];
    this.filteredMedicines = text
      ? source.filter(item => this.medicineLabel(item).toLowerCase().includes(text))
      : source;
  }

  openNativePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    try {
      input?.showPicker?.();
    } catch {
      // Some browsers only allow opening native pickers during direct user activation.
    }
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
