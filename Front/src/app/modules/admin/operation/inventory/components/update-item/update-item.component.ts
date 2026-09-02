import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { startWith, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-update-item',
    imports: [ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatIconModule],
    templateUrl: './update-item.component.html',
    styleUrl: './update-item.component.scss'
})
export class UpdateItemComponent {


    actionDialog: number;
    dataForm: UntypedFormGroup;
    aData1: any;
    aData2: any;
    aData3: any;
    aData4: any;
    service: string = 'Inventory';
    private _unsubscribeAll = new Subject<void>()
    needReferenceId: boolean = false;
  
    constructor(
      @Inject(MAT_DIALOG_DATA) private _data,
      private _matDialogRef: MatDialogRef<UpdateItemComponent>,
      private _formBuilder: UntypedFormBuilder,
      private _generalApi: GeneralApiService,
      private _toast: HotToastService,
    ) { }
  
    ngOnInit() {
      this.actionDialog = this._data?.action
      this.dataForm = this._formBuilder.group({
        idInveCategory: ['', [Validators.required]],
        name: ['', [Validators.required],],
        description: ['', [Validators.required],],
        stockMin: ['', [Validators.required]],
        code: ['', [],], //falta
        id_unit: ['', [Validators.required]],
        pictureTemp: ['', [],],
        picture: ['', [],],
        isConsumable: [false, [],],
        isExpirable: [false, [],],
        canAssign: [false, [],],
        canLoanInternal: [false, [],],
        canLoanExternal: [false, [],],
      });
      
  
      // ----Asignacion de datos extras------//
      // const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
      // const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();
  
      this.aData4 = this._data?.data4; // Unidades de medida
      this.aData2 = this._data?.data2; // categoria
      // ----Asignacion de datos extras------//

      this._generalApi.GetById(this.service, this._data.row?.id_item).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.dataForm.get('idInveCategory').setValue(response.data.idInveCategory);
            this.dataForm.get('name').setValue(response.data.name);
            this.dataForm.get('code').setValue(response.data.code);
            this.dataForm.get('description').setValue(response.data.description);
            this.dataForm.get('stockMin').setValue(response.data.stockMin);
            this.dataForm.get('id_unit').setValue(response.data.id_unit);
            this.dataForm.get('picture').setValue(response.data.picture);
            this.dataForm.get('isConsumable').setValue(response.data.isConsumable);
            this.dataForm.get('isExpirable').setValue(response.data.isExpirable);
            this.dataForm.get('canAssign').setValue(response.data.canAssign);
            this.dataForm.get('canLoanInternal').setValue(response.data.canLoanInternal);
            this.dataForm.get('canLoanExternal').setValue(response.data.canLoanExternal);
          } else {
            this._toast.error(response.error.detail);
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
        }
      });

  
  
      if (this._data.action == ActionType.Create) {
        //Crear
      }
      if (this._data.action !== ActionType.Create) {
        //Editar
        // Asignar valores
        // Asignar valores
  
        if (this._data.action == ActionType.Edit) {
          // Input Desabilitados
        // this.dataForm.get('idInveCategory').disable();
        // this.dataForm.get('name').disable();
        // this.dataForm.get('description').disable();
        // this.dataForm.get('stockMin').disable();
        // this.dataForm.get('id_unit').disable();
        // this.dataForm.get('description').disable();
        // this.dataForm.get('stockMin').disable();
        this.dataForm.get('id_unit').disable();
        // this.dataForm.get('picture').disable();
        // this.dataForm.get('isConsumable').disable();
        // this.dataForm.get('isExpirable').disable();
        // this.dataForm.get('canAssign').disable();
        // this.dataForm.get('canLoanInternal').disable();
        // this.dataForm.get('canLoanExternal').disable();
          // Input Desabilitados 
        }
      }
  
  
  
  
    }
  
  
  
    // private applyConditionalValidators(type: any) {
    //   this.OnIsReferenceDonationSelected();
  
    //   const idDonation = this.dataForm.get('idDonation')!;
  
    //   // Limpiar validadores
    //   idDonation.clearValidators();
  
    //   // Habilitar/deshabilitar controles según tipo
    //   if (this.needReferenceId == true) {
    //     idDonation.setValidators([
    //       Validators.required,
    //     ]);
    //     idDonation.enable();
    //   }
    //   else {
    //     idDonation.disable();
    //     idDonation.reset();
    //   }
  
    //   // Re-evaluar estado
    //   idDonation.updateValueAndValidity();
    // }
  
    uploadImage(fileList: FileList): void {
      if (!fileList.length) {
        return;
      }
  
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    const maxSizeMB = 0.1; // 0.1 MB = 100 KB
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const maxWidth = 300;
    const maxHeight = 300;

    const file = fileList[0];

    if (!allowedTypes.includes(file.type)) {
      this._toast.error(`Tipo de archivo no permitido.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      const sizeMB = file.size / (1024 * 1024);
      const formattedSize =
        sizeMB >= 1 ? `${sizeMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(0)} KB`;

      this._toast.error(`El archivo pesa ${formattedSize}. El máximo permitido es ${maxSizeMB} MB.`);
      return;
    }
      this._readAsDataURL(file).then((data) => {
        this.dataForm.get('picture').setValue(data)
        this.dataForm.get('pictureTemp').setValue(data)
      });
    }
  
    private _readAsDataURL(file: File): Promise<any> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (): void => {
          resolve(reader.result);
        };
        reader.onerror = (e): void => {
          reject(e);
        };
        reader.readAsDataURL(file);
      });
    }
  
  
    create() {
      // if (this.dataForm.get('isExpirable')!.value == false) {
      //   this.dataForm.get('expirationDate').setValue(null)
      // }
      this.dataForm.get('picture').setValue(null)
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
      const idData = this._data.row?.id_item; //OJO
      this._generalApi.modify(`${this.service}/item`, idData, payload).subscribe({
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
  
    // changeStatus() {
    //   const payload = this.dataForm.getRawValue();
    //   const idData = this._data.row?.batchId; //OJO
    //   this._generalApi.changeStatus(this.service, idData, payload).subscribe({
    //     next: (response: ApiResponse<any>) => {
    //       if (response.success) {
    //         this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
    //       } else {
    //         this._toast.error(response.error.detail);
    //       }
    //     },
    //     error: (error) => {
    //       this._toast.error('Error inesperado. Intenta más tarde.');
    //     }
    //   });
    // }
  
  
    // delete() {
    //   const payload = this.dataForm.getRawValue();
    //   const idData = this._data.row?.batchId;//OJO
    //   this._generalApi.delete(this.service, idData).subscribe({
    //     next: (response: ApiResponse<any>) => {
    //       if (response.success) {
    //         this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
    //       } else {
    //         this._toast.error(response.error.detail);
    //       }
    //     },
    //     error: (error) => {
    //       this._toast.error('Error inesperado. Intenta más tarde.');
    //     }
    //   });
    // }
  
    // reverse() {
    //   const payload = this.dataForm.getRawValue();
    //   const idData = this._data.row?.batchId;//OJO
    //   this._generalApi.reverse(this.service, idData).subscribe({
    //     next: (response: ApiResponse<any>) => {
    //       if (response.success) {
    //         this._matDialogRef.close({ idAction: this._data.action, idData: idData, ...payload });
    //       } else {
    //         this._toast.error(response.error.detail);
    //       }
    //     },
    //     error: (error) => {
    //       this._toast.error('Error inesperado. Intenta más tarde.');
    //     }
    //   });
    // }
  
    ngOnDestroy() {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
    }
  
  
    // -----METODOS DEL DIALOG------//
    save() {
      if (this.dataForm.invalid) return;
  
      if (this._data.action == ActionType.Create) {
        //this.create();
      } else if (this._data.action == ActionType.Edit) {
        this.edit();
      }
      else if (this._data.action == ActionType.ChangeStatus) {
        //3
        //this.changeStatus();
      }
      else if (this._data.action == ActionType.Delete) {
        //3
        //this.delete();
      }
      else if (this._data.action == ActionType.View) {
        //this.close();
      }
      else if (this._data.action == ActionType.Reverse) {
        //this.reverse();
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
  
    OnIsReferenceDonationSelected() {
      this.needReferenceId = this.aData1.find((item: any) => item.idInveEntryType === this.dataForm.get('idInveEntryType').value)?.requiresDonationRef ?? false;
    }


    
}
