import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-role-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './role-dialog.component.html',
  styleUrl: './role-dialog.component.scss'
})
export class RoleDialogComponent {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<RoleDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {

    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      name: ['', [Validators.required],],
      status: ['', Validators.required],
    });

    // ----Asignacion de datos extras------//
    this.aData1 = this._data.data1;
    // ----Asignacion de datos extras------//

    if (this._data.action == 1) {
      //Crear
    }
    if (this._data.action == 2) {
      //Editar
      // Asignar valores
      this.dataForm.get('name').setValue(this._data.row?.name);
      this.dataForm.get('status').setValue(this._data.row?.status);
      // Asignar valores

      // Input Desabilitados
      // Input Desabilitados
    }
    if (this._data.action == 3) {
      //Cambiar estado
      // Input Desabilitados
      // Input Desabilitados
    }
    if (this._data.action == 4) {
      //Eliminar

      // Asignar valores
      this.dataForm.get('name').setValue(this._data.row?.name);
      this.dataForm.get('status').setValue(this._data.row?.status);
      // Asignar valores

      // Input Desabilitados
      this.dataForm.get('name').disable();
      this.dataForm.get('status').disable();
      // Input Desabilitados
    }
  }

  create() {
    const payload = this.dataForm.getRawValue();
    this._generalApi.add("Role", payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, ...response.data });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  edit() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;
    this._generalApi.modify("Role", idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  changeStatus() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;
    this._generalApi.changeStatus("Role", idData, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }


  delete() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.id;//OJO
    this._generalApi.delete("Role", idData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }


  // -----METODOS DEL DIALOG------//
  save() {
    if (this.dataForm.invalid) return;

    if (this._data.action == 1) {
      this.create();
    } else if (this._data.action == 2) {
      this.edit();
    }
    else if (this._data.action == 3) {
      //3
      this.changeStatus();
    }
    else if (this._data.action == 4) {
      //3
      this.delete();
    }
  }

  close() {
    this._matDialogRef.close();
  }
  // -----METODOS DEL DIALOG------//


  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFieldValue<
    T extends Record<string, any>,
    K extends keyof T,
    I extends keyof T = 'Id'
  >(
    items: T[],
    id: T[I],
    fieldName: K,
    idField: I = 'Id' as I
  ): T[K] | undefined {
    const found = items.find(item => item[idField] === id);
    return found ? found[fieldName] : undefined;
  }





}
