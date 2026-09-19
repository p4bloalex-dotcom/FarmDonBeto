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
      category: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      location: [{ value: '', disabled: this.isViewMode }],
      responsible: [{ value: '', disabled: this.isViewMode }],
      purchaseDate: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      purchaseCost: [{ value: 0, disabled: this.isViewMode || this.isTransferMode }, [Validators.required, Validators.min(0)]],
      accumulatedDepreciation: [{ value: 0, disabled: this.isViewMode || this.isTransferMode }, [Validators.required, Validators.min(0)]],
      usefulLifeMonths: [{ value: null, disabled: this.isViewMode || this.isTransferMode }],
      status: [{ value: 'E', disabled: this.isViewMode || this.isTransferMode }, Validators.required],
      notes: [{ value: '', disabled: this.isViewMode || this.isTransferMode }],
      reason: [{ value: '', disabled: !this.isTransferMode }, this.isTransferMode ? Validators.required : []]
    });
    this.loadBranches();
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
      },
      error: () => this._toast.error('Error inesperado al cargar activo fijo.')
    });
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
}
