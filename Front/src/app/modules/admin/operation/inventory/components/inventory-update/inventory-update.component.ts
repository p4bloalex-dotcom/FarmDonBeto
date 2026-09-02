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
    selector: 'app-inventory-update',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatIconModule
    ],
    templateUrl: './inventory-update.component.html',
    styleUrl: './inventory-update.component.scss'
})
export class InventoryUpdateComponent {
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
    private _matDialogRef: MatDialogRef<InventoryUpdateComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      id_item: ['', [Validators.required]],
      idInveEntryType: ['', []],
      idDonation: ['', [],],
      name: ['', [Validators.required],],
      description: ['', [Validators.required],],
      newStock: ['', [Validators.required]],
      code: ['', [],], //falta
      uniName: ['', [Validators.required]],
      expirationDate: ['', [],],
      isExpirable: [false, [],],
      id_item_exit_type: ['', []],
    });

    this.dataForm.get('idInveEntryType')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('idInveEntryType')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: any) => this.applyConditionalValidators(type));


    this.aData1 = this._data?.data1;//Metodo de ingreso, tendria que tener si necesita la id donacion
    this.aData3 = this._data?.data3; // donaciones referencia
    // ----Asignacion de datos extras------//

    this.getList()
    

    if (this._data.action == ActionType.Create) {
      //Crear
    }
    if (this._data.action !== ActionType.Create) {
      //Editar
      // Asignar valores
      this.dataForm.get('id_item').setValue(this._data.row?.id_item);
      this.dataForm.get('name').setValue(this._data.row?.name);
      this.dataForm.get('description').setValue(this._data.row?.description);
      this.dataForm.get('code').setValue(this._data.row?.code);
      this.dataForm.get('uniName').setValue(this._data.row?.uniName);
      // Asignar valores

      if (this._data.action == ActionType.Edit) {
        // Input Desabilitados
        this.dataForm.get('name').disable();
        this.dataForm.get('description').disable();
        this.dataForm.get('code').disable();
        this.dataForm.get('uniName').disable();

        const idInveEntryType = this.dataForm.get('idInveEntryType')!;
        idInveEntryType.clearValidators();
        idInveEntryType.setValidators([ Validators.required,]);
        idInveEntryType.enable();
        idInveEntryType.updateValueAndValidity();

        const id_item_exit_type = this.dataForm.get('id_item_exit_type')!;
        id_item_exit_type.disable();
        id_item_exit_type.reset();
        // Input Desabilitados 
      }
      else if (this._data.action == ActionType.ChangeStatus) {
      }
      else if (this._data.action == ActionType.Delete) {
      }
      else if (this._data.action == ActionType.View) {
      }
      else if (this._data.action == ActionType.Reverse) {
      }
      else if (this._data.action == ActionType.WriteOFF){
        this.dataForm.get('name').disable();
        this.dataForm.get('description').disable();
        this.dataForm.get('code').disable();
        this.dataForm.get('uniName').disable();
        this.dataForm.get('code').disable();
        this.dataForm.get('uniName').disable();

        const id_item_exit_type = this.dataForm.get('id_item_exit_type')!;
        id_item_exit_type.clearValidators();
        id_item_exit_type.setValidators([ Validators.required,]);
        id_item_exit_type.enable();
        id_item_exit_type.updateValueAndValidity();

        const idInveEntryType = this.dataForm.get('idInveEntryType')!;
        idInveEntryType.disable();
        idInveEntryType.reset();
      }
      else{
      }


    }




  }

  getList(): void {
    if (this._data.action == ActionType.WriteOFF) {
      const endpoints = ['ItemExitType'];
      this._generalApi.comboList(endpoints)
        .subscribe({
          next: ([data4]) => {
            this.aData4 = data4;
          },
          error: err => {
            this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
          }
        });
    }
  }



  private applyConditionalValidators(type: any) {
    this.OnIsReferenceDonationSelected();

    const idDonation = this.dataForm.get('idDonation')!;

    // Limpiar validadores
    idDonation.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (this.needReferenceId == true) {
      idDonation.setValidators([
        Validators.required,
      ]);
      idDonation.enable();
    }
    else {
      idDonation.disable();
      idDonation.reset();
    }

    // Re-evaluar estado
    idDonation.updateValueAndValidity();
  }

  uploadImage(fileList: FileList): void {
    if (!fileList.length) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const file = fileList[0];

    if (!allowedTypes.includes(file.type)) {
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
    if (this.dataForm.get('isExpirable')!.value == false) {
      this.dataForm.get('expirationDate').setValue(null)
    }
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
    const idData = this._data.row?.batchId; //OJO
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
    const idData = this._data.row?.batchId;//OJO
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

  reverse() {
    const payload = this.dataForm.getRawValue();
    const idData = this._data.row?.batchId;//OJO
    this._generalApi.reverse(this.service, idData).subscribe({
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

  unsuscribe() {
    const payload = this.dataForm.getRawValue();
    const dataMap = {
      NewStock: payload.newStock,
      Id_item_exit_type: payload.id_item_exit_type,
      Id_item: payload.id_item
    };
    const idData = this._data.row?.id_item;//OJO
    this._generalApi.unsuscribe(this.service, dataMap).subscribe({
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

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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
    else if (this._data.action == ActionType.View) {
      this.close();
    }
    else if (this._data.action == ActionType.Reverse) {
      this.reverse();
    }
        else if (this._data.action == ActionType.WriteOFF) {
      this.unsuscribe();
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
