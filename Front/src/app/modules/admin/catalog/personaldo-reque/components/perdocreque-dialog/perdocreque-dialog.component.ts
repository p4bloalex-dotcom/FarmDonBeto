import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
    selector: 'app-perdocreque-dialog',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
    ],
    templateUrl: './perdocreque-dialog.component.html',
    styleUrl: './perdocreque-dialog.component.scss'
})
export class PerdocrequeDialogComponent {
  
  actionDialog : number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service:string = 'PersonalDocumentsRequeriment';
  constructor( 
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<PerdocrequeDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ){}

  ngOnInit(){

    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      idTypePersonal: ['',[Validators.required],],
      idTypeDocument: ['',[Validators.required],],
      isMandatory: [false,[],],
      status: ['', Validators.required],
    });

    // ----Asignacion de datos extras------//
    const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
    const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();

    this.aData1 = [...m1].map(([id, name]) => ({ id, name }));
    this.aData2 = [...m2].map(([id, name]) => ({ id, name }));
    // ----Asignacion de datos extras------//
    if (this._data.action == 1) {
      //Crear
    }
    if(this._data.action == 2){
      //Editar
      // Asignar valores
      this.dataForm.get('idTypePersonal').setValue(this._data.row?.idTypePersonal);
      this.dataForm.get('idTypeDocument').setValue(this._data.row?.idTypeDocument);
      this.dataForm.get('isMandatory').setValue(this._data.row?.isMandatory);
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
      this.dataForm.get('idTypePersonal').setValue(this._data.row?.idTypePersonal);
      this.dataForm.get('idTypeDocument').setValue(this._data.row?.idTypeDocument);
      this.dataForm.get('isMandatory').setValue(this._data.row?.isMandatory);
      this.dataForm.get('status').setValue(this._data.row?.status);
      // Asignar valores

      // Input Desabilitados
      this.dataForm.get('idTypePersonal').disable();
      this.dataForm.get('idTypeDocument').disable();
      this.dataForm.get('isMandatory').disable();
      this.dataForm.get('status').disable();
      // Input Desabilitados
    }
  }

  create(){
    const payload = this.dataForm.getRawValue();
    this._generalApi.add(this.service, payload ).subscribe({
        next: (response:ApiResponse<any>) => {
            if (response.success) {
              this._matDialogRef.close({idAction: this._data.action, ...response.data });
            } else {
              this._toast.error(response.error.detail);
            }
        },
        error: (error) => {
            this._toast.error('Error inesperado. Intenta más tarde.');
        }
    });
  }

  edit(){
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.idPersonalDocuReq; //OJO
    this._generalApi.modify(this.service, idData, payload ).subscribe({
        next: (response:ApiResponse<any>) => {
            if (response.success) {
              this._matDialogRef.close({idAction: this._data.action, idData: idData, ...payload });
            } else {
              this._toast.error(response.error.detail);
            }
        },
        error: (error) => {
            this._toast.error('Error inesperado. Intenta más tarde.');
        }
    });
  }

  changeStatus(){
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.idPersonalDocuReq;
    this._generalApi.changeStatus(this.service, idData, payload ).subscribe({
        next: (response:ApiResponse<any>) => {
            if (response.success) {
              this._matDialogRef.close({idAction: this._data.action, idData: idData, ...payload });
            } else {
              this._toast.error(response.error.detail);
            }
        },
        error: (error) => {
            this._toast.error('Error inesperado. Intenta más tarde.');
        }
    });
  }


  delete(){
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.idPersonalDocuReq;//OJO
    this._generalApi.delete(this.service, idData ).subscribe({
        next: (response:ApiResponse<any>) => {
            if (response.success) {
              this._matDialogRef.close({idAction: this._data.action, idData: idData, ...payload });
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
    }else if(this._data.action == 2){
      this.edit();
    }
    else if(this._data.action == 3){
      //3
      this.changeStatus();
    }
    else if(this._data.action == 4){
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
