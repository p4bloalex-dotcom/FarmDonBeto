import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-fixed-asset-form-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './fixed-asset-form-dialog.component.html',
  styleUrl: './fixed-asset-form-dialog.component.scss'
})
export class FixedAssetFormDialogComponent implements OnInit {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  branches: any[] = [];
  isViewMode = false;
  isTransferMode = false;
  categoryOptions = ['Equipo de computo', 'Vehiculo', 'Refrigeracion', 'Mobiliario', 'Lector', 'Otro'];
  attributeFields: Record<string, { key: string; label: string; type?: string }[]> = {
    'Vehiculo': [{ key: 'placa', label: 'Placa' }, { key: 'anio', label: 'Año', type: 'number' }, { key: 'kilometraje', label: 'Kilometraje', type: 'number' }],
    'Equipo de computo': [{ key: 'procesador', label: 'Procesador' }, { key: 'ram', label: 'RAM' }, { key: 'almacenamiento', label: 'Almacenamiento' }],
    'Refrigeracion': [{ key: 'capacidad', label: 'Capacidad' }, { key: 'temperaturaMinima', label: 'Temperatura minima', type: 'number' }, { key: 'temperaturaMaxima', label: 'Temperatura maxima', type: 'number' }]
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<FixedAssetFormDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.isViewMode = this.actionDialog === 7;
    this.isTransferMode = this.actionDialog === 8;
    this.dataForm = this._formBuilder.group({
      branchId: [{ value: '', disabled: this.isViewMode }, Validators.required],
      code: [{ value: '', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      name: [{ value: '', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      category: [{ value: '', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      brand: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      model: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      serialNumber: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      location: [{ value: '', disabled: this.isViewMode }],
      responsible: [{ value: '', disabled: this.isViewMode }],
      purchaseDate: [{ value: '', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      purchaseCost: [{ value: 0, disabled: this.isViewMode || this.isTransferMode }, [Validators.required, Validators.min(0)]],
      supplier: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      usefulLifeMonths: [{ value: null, disabled: this.isViewMode || this.isTransferMode }],
      condition: [{ value: 'BUENO', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      attributes: this._formBuilder.group({}),
      status: [{ value: 'E', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      notes: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      reason: [{ value: '', disabled: !this.isTransferMode }, this.isTransferMode ? Validators.required : []]
    });
    this.loadBranches();
    this.dataForm.get('category')?.valueChanges.subscribe(() => this.rebuildAttributes());
    if (this._data?.row) this.loadAsset(this._data.row.id);
  }

  loadBranches(): void {
    this._generalApi.getList('Branch').subscribe({
      next: (resp: ApiResponse<any>) => this.branches = resp.success ? resp.data : [],
      error: () => this._toast.error('Error inesperado al cargar sucursales.')
    });
  }

  loadAsset(id: number): void {
    this._generalApi.GetById('FixedAsset', id).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el activo.');
        this.dataForm.patchValue({ ...resp.data, purchaseDate: this.toDateInput(resp.data.purchaseDate) });
        this.rebuildAttributes(resp.data.attributes ?? {});
      },
      error: () => this._toast.error('Error inesperado al cargar activo fijo.')
    });
  }

  get bookValue(): number {
    return Math.max(this.purchaseCost - this.accumulatedDepreciation, 0);
  }

  get purchaseCost(): number { return Number(this.dataForm?.getRawValue?.().purchaseCost ?? 0); }
  get accumulatedDepreciation(): number {
    const value = this.dataForm?.getRawValue?.() ?? {};
    const cost = Number(value.purchaseCost ?? 0);
    const life = Number(value.usefulLifeMonths ?? 0);
    const purchaseDate = value.purchaseDate ? new Date(value.purchaseDate) : null;
    if (!cost || !life || !purchaseDate || isNaN(purchaseDate.getTime())) return 0;
    const now = new Date();
    const months = Math.max((now.getFullYear() - purchaseDate.getFullYear()) * 12 + now.getMonth() - purchaseDate.getMonth() + (now.getDate() >= purchaseDate.getDate() ? 0 : -1), 0);
    return Math.min(Number(((cost / life) * months).toFixed(2)), cost);
  }

  get currentAttributeFields(): { key: string; label: string; type?: string }[] { return this.attributeFields[this.dataForm?.getRawValue?.().category] ?? []; }

  get title(): string {
    if (this.actionDialog === 1) return 'Nuevo activo fijo';
    if (this.actionDialog === 2) return 'Editar activo fijo';
    if (this.actionDialog === 8) return 'Trasladar activo fijo';
    return 'Detalle de activo fijo';
  }

  save(): void {
    if (this.dataForm.invalid) return;
    const payload = this.dataForm.getRawValue();
    const request = this.isTransferMode ? this._generalApi.postAction('FixedAsset', this._data.row.id, 'transfer', {
      branchId: payload.branchId,
      location: payload.location,
      responsible: payload.responsible,
      reason: payload.reason
    }) : this.actionDialog === 2 ? this._generalApi.modify('FixedAsset', this._data.row.id, payload) : this._generalApi.add('FixedAsset', payload);
    request.subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this._matDialogRef.close(resp.data) : this._toast.error(resp.error?.detail ?? 'No se pudo guardar el activo.'),
      error: () => this._toast.error('Error inesperado al guardar activo fijo.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }

  private toDateInput(value: any): string {
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  private rebuildAttributes(values: any = null): void {
    const group = this._formBuilder.group({});
    const source = values ?? this.dataForm.getRawValue().attributes ?? {};
    this.currentAttributeFields.forEach(field => group.addControl(field.key, this._formBuilder.control({ value: source[field.key] ?? '', disabled: this.isViewMode || this.isTransferMode })));
    this.dataForm.setControl('attributes', group);
  }
}
