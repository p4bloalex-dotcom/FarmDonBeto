import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-service-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './service-dialog.component.html',
  styleUrl: './service-dialog.component.scss'
})
export class ServiceDialogComponent implements OnInit {

  actionDialog: number;
  dataForm: UntypedFormGroup;
  service: string = 'Service';

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<ServiceDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action;
    
    this.dataForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      duration_minutes: ['', [Validators.required]],
      gap_service: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      status: ['', [Validators.required]],
    });

    const row = this._data?.row;

    if (this.actionDialog === ActionType.Create) {
      this.dataForm.get('status').setValue('E'); // Default to Active (Estado: 'E')
      this.dataForm.get('duration_minutes').setValue('00:30'); // Default to 30 mins
      this.dataForm.get('gap_service').setValue('00:00'); // Default to 0 mins
    } else {
      // For Edit, ChangeStatus, Delete - populate values
      this.dataForm.patchValue({
        name: row?.name || '',
        description: row?.description || '',
        duration_minutes: this.formatTimeSpan(row?.duration_minutes),
        gap_service: this.formatTimeSpan(row?.gap_service),
        price: row?.price || '',
        status: row?.status || '',
      });
    }

    if (this.actionDialog === ActionType.ChangeStatus) {
      // Toggle the status automatically or let the user choose, and disable other fields
      this.dataForm.get('name').disable();
      this.dataForm.get('description').disable();
      this.dataForm.get('duration_minutes').disable();
      this.dataForm.get('gap_service').disable();
      this.dataForm.get('price').disable();
    }

    if (this.actionDialog === ActionType.Delete) {
      // Disable all fields for confirmation
      this.dataForm.disable();
    }
  }

  formatTimeSpan(value: any): string {
    if (!value) return '00:00';
    const parts = value.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return '00:00';
  }

  create() {
    const payload = this.dataForm.getRawValue();
    this._generalApi.add(this.service, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, ...response.data });
        } else {
          this._toast.error(response.error?.detail || 'Error al guardar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  edit() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id ?? this._data.row?.idService ?? this._data.row?.id_service;
    this._generalApi.modify(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al modificar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  changeStatus() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id ?? this._data.row?.idService ?? this._data.row?.id_service;
    this._generalApi.changeStatus(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al cambiar de estado');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  delete() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id ?? this._data.row?.idService ?? this._data.row?.id_service;
    this._generalApi.delete(this.service, idData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al eliminar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  save() {
    if (this.dataForm.invalid && this.actionDialog !== ActionType.Delete) return;

    if (this.actionDialog === ActionType.Create) {
      this.create();
    } else if (this.actionDialog === ActionType.Edit) {
      this.edit();
    } else if (this.actionDialog === ActionType.ChangeStatus) {
      this.changeStatus();
    } else if (this.actionDialog === ActionType.Delete) {
      this.delete();
    }
  }

  close() {
    this._matDialogRef.close();
  }

}
