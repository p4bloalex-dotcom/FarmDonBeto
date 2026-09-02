import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-business-hour-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  templateUrl: './business-hour-dialog.component.html',
  styleUrl: './business-hour-dialog.component.scss'
})
export class BusinessHourDialogComponent implements OnInit {

  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any[] = [];
  service: string = 'BusinessHour';

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<BusinessHourDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action;
    this.aData1 = this._data?.data1 || [];

    this.dataForm = this._formBuilder.group({
      day_week: ['', [Validators.required]],
      open_time: ['08:00', [Validators.required]],
      close_time: ['17:00', [Validators.required]],
      is_closed: [false],
      status: ['E', [Validators.required]],
    });

    const row = this._data?.row;

    if (this.actionDialog !== ActionType.Create) {
      this.dataForm.patchValue({
        day_week: row?.day_week ?? '',
        open_time: this.formatTime(row?.open_time),
        close_time: this.formatTime(row?.close_time),
        is_closed: row?.is_closed ?? false,
        status: row?.status || 'E',
      });
    }

    this.toggleTimeValidators(this.dataForm.get('is_closed')?.value);
    this.dataForm.get('is_closed')?.valueChanges.subscribe((isClosed) => this.toggleTimeValidators(isClosed));

    if (this.actionDialog === ActionType.ChangeStatus) {
      this.dataForm.get('day_week').disable();
      this.dataForm.get('open_time').disable();
      this.dataForm.get('close_time').disable();
      this.dataForm.get('is_closed').disable();
    }

    if (this.actionDialog === ActionType.Delete) {
      this.dataForm.disable();
    }
  }

  toggleTimeValidators(isClosed: boolean): void {
    const openTime = this.dataForm.get('open_time');
    const closeTime = this.dataForm.get('close_time');

    if (isClosed) {
      openTime?.clearValidators();
      closeTime?.clearValidators();
    } else {
      openTime?.setValidators([Validators.required]);
      closeTime?.setValidators([Validators.required]);
    }

    openTime?.updateValueAndValidity();
    closeTime?.updateValueAndValidity();
  }

  formatTime(value: any): string {
    if (!value) return '00:00';
    const parts = String(value).split(':');
    return parts.length >= 2 ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : '00:00';
  }

  buildPayload(): any {
    const payload = this.dataForm.getRawValue();
    return {
      ...payload,
      day_week: Number(payload.day_week),
      open_time: payload.is_closed ? '00:00' : payload.open_time,
      close_time: payload.is_closed ? '00:00' : payload.close_time,
    };
  }

  validateHourRange(payload: any): boolean {
    if (!payload.is_closed && payload.open_time >= payload.close_time) {
      this._toast.error('La hora de apertura debe ser menor a la hora de cierre.');
      return false;
    }

    return true;
  }

  create() {
    const payload = this.buildPayload();
    if (!this.validateHourRange(payload)) return;

    this._generalApi.add(this.service, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, ...response.data });
        } else {
          this._toast.error(response.error?.detail || 'Error al guardar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta mas tarde.');
      }
    });
  }

  edit() {
    const payload = this.buildPayload();
    if (!this.validateHourRange(payload)) return;

    const idData = this._data.row?.id;
    this._generalApi.modify(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, id: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al modificar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta mas tarde.');
      }
    });
  }

  changeStatus() {
    const payload = this.buildPayload();
    const idData = this._data.row?.id;
    this._generalApi.changeStatus(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al cambiar de estado');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta mas tarde.');
      }
    });
  }

  delete() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;
    this._generalApi.delete(this.service, idData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al eliminar el registro');
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta mas tarde.');
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
