import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
    selector: 'app-uniitem-dialog',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatDialogModule
    ],
    templateUrl: './uniitem-dialog.component.html',
    styleUrl: './uniitem-dialog.component.scss'
})
export class UniitemDialogComponent {

      actionDialog: number;
          dataForm: UntypedFormGroup;
          aData1: any;
          aData2: any;
          service: string = 'UnitItem';
          constructor(
            @Inject(MAT_DIALOG_DATA) private _data,
            private _matDialogRef: MatDialogRef<UniitemDialogComponent>,
            private _formBuilder: UntypedFormBuilder,
            private _generalApi: GeneralApiService,
            private _toast: HotToastService,
          ) { }
        
          ngOnInit() {
        
            this.actionDialog = this._data?.action
            this.dataForm = this._formBuilder.group({
              name: ['', [Validators.required],],
              code: ['', [Validators.required],],
              status: ['E', [Validators.required],],
            });
        
            // ----Asignacion de datos extras------//
            // const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
            // const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();
        
            // this.aData1 = [...m1].map(([id, name]) => ({ id, name }));
            // this.aData2 = [...m2].map(([id, name]) => ({ id, name }));
            // ----Asignacion de datos extras------//
            if (this._data.action == ActionType.Create) {
              //Crear
            }
            if (this._data.action !== ActionType.Create) {
              //Editar
              // Asignar valores
              this.dataForm.get('name').setValue(this._data.row?.name);
              this.dataForm.get('code').setValue(this._data.row?.code);
              this.dataForm.get('status').setValue(this._data.row?.status);
              // Asignar valores
      
              if (this._data.action == ActionType.Edit) {
                // Input Desabilitados
                // Input Desabilitados 
              }
              if (this._data.action == ActionType.Delete) {
                this.dataForm.get('name').disable();
                this.dataForm.get('code').disable();
                this.dataForm.get('status').disable();
              }
            }
          }
        
          create() {
            const payload = this.dataForm.getRawValue();
            this._generalApi.add(this.service, payload).subscribe({
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
            const idData = this._data.row?.id_unit; //OJO
            this._generalApi.modify(this.service, idData, payload).subscribe({
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
            const idData = this._data.row?.id_unit; //OJO
            this._generalApi.changeStatus(this.service, idData, payload).subscribe({
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
            const idData = this._data.row?.id_unit;//OJO
            this._generalApi.delete(this.service, idData).subscribe({
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
        
            if (this._data.action == ActionType.Create) {
              this.create();
            } else if (this._data.action == ActionType.Edit) {
              this.edit();
            }
            else if (this._data.action == ActionType.ChangeStatus) {
              //3
              this.changeStatus();
            }
            else if (this._data.action == ActionType.Delete) {
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
