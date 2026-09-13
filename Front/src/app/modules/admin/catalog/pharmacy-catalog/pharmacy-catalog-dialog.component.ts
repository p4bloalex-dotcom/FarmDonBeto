import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { PharmacyCatalogConfig, PharmacyFieldConfig } from './pharmacy-catalog.config';

@Component({
  selector: 'app-pharmacy-catalog-dialog',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './pharmacy-catalog-dialog.component.html',
  styleUrl: './pharmacy-catalog-dialog.component.scss'
})
export class PharmacyCatalogDialogComponent {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  config: PharmacyCatalogConfig;
  options: Record<string, any[]> = {};

  constructor(@Inject(MAT_DIALOG_DATA) private _data, private _matDialogRef: MatDialogRef<PharmacyCatalogDialogComponent>, private _formBuilder: UntypedFormBuilder, private _generalApi: GeneralApiService, private _toast: HotToastService) {}

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.config = this._data?.config;
    const controls = this.config.fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: ['', field.required ? [Validators.required] : []]
    }), { status: ['E', [Validators.required]] });
    this.dataForm = this._formBuilder.group(controls);
    this.loadOptions();

    if (this.actionDialog !== 1) {
      const row = { ...this._data.row };
      this.config.fields.forEach(field => {
        if ((field.type === 'datetime' || field.type === 'date') && row[field.name]) {
          row[field.name] = this.toLocalInput(row[field.name]);
        }
      });
      this.dataForm.patchValue(row);
    }
    if (this.actionDialog === 4) this.dataForm.disable();
  }

  loadOptions(): void {
    this.config.fields.filter(field => field.type === 'select' && field.endpoint).forEach(field => {
      this._generalApi.getList(field.endpoint).subscribe({
        next: (resp: ApiResponse<any>) => this.options[field.name] = resp.success ? resp.data : [],
        error: () => this._toast.error('Error inesperado. Intenta más tarde.')
      });
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    if (this.actionDialog === 1) this.create();
    if (this.actionDialog === 2) this.edit();
    if (this.actionDialog === 4) this.delete();
  }

  create(): void {
    const payload = this.dataForm.getRawValue();
    this.config.fields.forEach(field => {
      if ((field.type === 'datetime' || field.type === 'date') && !payload[field.name]) {
        payload[field.name] = this.toLocalInput(new Date());
      }
    });
    this._generalApi.add(this.config.service, payload).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this.actionDialog, ...this.buildRow({ ...payload, ...response.data }) }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  edit(): void {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;
    this._generalApi.modify(this.config.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this.actionDialog, idData, ...this.buildRow({ ...this._data.row, ...payload }) }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  delete(): void {
    const idData = this._data.row?.id;
    this._generalApi.delete(this.config.service, idData).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this.actionDialog, idData }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getOptionValue(item: any): any {
    return item.id ?? item.idData;
  }

  getOptionLabel(field: PharmacyFieldConfig, item: any): any {
    if (field.optionLabel && item?.[field.optionLabel] != null) {
      return item[field.optionLabel];
    }
    return item?.name ?? `# ${item?.id ?? ''}`;
  }

  isWideField(field: PharmacyFieldConfig): boolean {
    return field.type === 'textarea' || field.name === 'description';
  }

  private toLocalInput(value: any): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private buildRow(row: any): any {
    const relationNames: Record<string, string> = {
      laboratory_id: 'laboratoryName',
      presentation_id: 'presentationName',
      category_id: 'categoryName',
      unit_measurement_id: 'unitMeasurementName',
      supplier_id: 'supplierName',
      medicine_id: 'medicineName',
      branch_id: 'branchName',
      cash_register_id: 'cashRegisterName',
      movement_type_id: 'movementTypeName'
    };

    this.config.fields.filter(field => field.type === 'select').forEach(field => {
      const selected = (this.options[field.name] || []).find(item => this.getOptionValue(item) === row[field.name]);
      if (selected && relationNames[field.name]) {
        row[relationNames[field.name]] = this.getOptionLabel(field, selected);
      }
    });

    return row;
  }
}
