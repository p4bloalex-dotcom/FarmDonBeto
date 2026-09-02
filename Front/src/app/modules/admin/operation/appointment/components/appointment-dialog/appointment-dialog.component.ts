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
  selector: 'app-appointment-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrl: './appointment-dialog.component.scss'
})
export class AppointmentDialogComponent implements OnInit {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  service: string = 'Appointment';
  services: any[] = [];
  employees: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<AppointmentDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action;
    const row = this._data?.row;

    this.dataForm = this._formBuilder.group({
      source: ['', [Validators.required]],
      start_at: ['', [Validators.required]],
      end_at: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
      customer_id: ['', [Validators.required]],
      employee_id: ['', [Validators.required]],
      service_id: ['', [Validators.required]],
      status: ['E', [Validators.required]],
    });

    this.loadCombos();

    if (this.actionDialog === ActionType.Create) {
      const startAt = row?.start_at ? this.toInputDate(row.start_at) : '';
      this.dataForm.patchValue({
        source: 'Manual',
        start_at: startAt,
        end_at: startAt,
        status: 'E'
      });
    } else {
      this.dataForm.patchValue({
        source: row?.source || '',
        start_at: this.toInputDate(row?.start_at),
        end_at: this.toInputDate(row?.end_at),
        price: row?.price || 0,
        notes: row?.notes || '',
        customer_id: row?.customer_id || '',
        employee_id: row?.employee_id || '',
        service_id: row?.service_id || '',
        status: row?.status || 'E',
      });
    }

    if (this.actionDialog === ActionType.ChangeStatus) {
      this.dataForm.get('source').disable();
      this.dataForm.get('start_at').disable();
      this.dataForm.get('end_at').disable();
      this.dataForm.get('price').disable();
      this.dataForm.get('notes').disable();
      this.dataForm.get('customer_id').disable();
      this.dataForm.get('employee_id').disable();
      this.dataForm.get('service_id').disable();
    }

    if (this.actionDialog === ActionType.Delete) {
      this.dataForm.disable();
    }
  }

  loadCombos(): void {
    this._generalApi.comboList(['Service', 'Personal']).subscribe({
      next: ([services, employees]) => {
        this.services = services;
        this.employees = employees;
      },
      error: () => this._toast.error('Error al cargar los catalogos')
    });
  }

  toInputDate(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  normalizePayload(): any {
    const payload = this.dataForm.getRawValue();
    return {
      ...payload,
      start_at: new Date(payload.start_at).toISOString(),
      end_at: new Date(payload.end_at).toISOString(),
      customer_id: Number(payload.customer_id),
      employee_id: Number(payload.employee_id),
      service_id: Number(payload.service_id),
      price: Number(payload.price),
    };
  }

  create() {
    const payload = this.normalizePayload();
    this._generalApi.add(this.service, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, ...response.data });
        } else {
          this._toast.error(response.error?.detail || 'Error al guardar el registro');
        }
      },
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  edit() {
    const payload = this.normalizePayload();
    const idData = this._data.row?.id;
    this._generalApi.modify(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al modificar el registro');
        }
      },
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  changeStatus() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;
    this._generalApi.changeStatus(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error?.detail || 'Error al cambiar de estado');
        }
      },
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
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
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
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
