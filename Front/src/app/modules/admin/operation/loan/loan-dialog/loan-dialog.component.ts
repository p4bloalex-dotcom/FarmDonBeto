import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loan-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './loan-dialog.component.html',
  styleUrl: './loan-dialog.component.scss'
})
export class LoanDialogComponent {

  unitProduct: any = ''
  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service: string = 'Loan';
  private _unsubscribeAll = new Subject<void>()
  // isInterSelected: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<LoanDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      typeApplicant: ['', [Validators.required],],
      id_item: ['', [Validators.required],],
      quantity: ['', [Validators.required]],
      id_personal: ['', [],],
      name: ['', []],
      dPI: ['', [],],
      phoneNumber: ['', [],],
      address: ['', [],],
      returnDate: ['', [Validators.required]],
      description: ['', []],
      quantityReturn: ['0', []],
    });

    this.dataForm.get('typeApplicant')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('typeApplicant')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: any) => this.applyConditionalValidators(type));

    // ----Asignacion de datos extras------//
    // const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
    // const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();

    this.aData1 = this._data?.data1;   //personal
    this.aData2 = this._data?.data2; //productos
    // ----Asignacion de datos extras------//


    if (this._data.action == ActionType.Create) {
      //Crear
    }
    if (this._data.action !== ActionType.Create) {
      //Editar
      // Asignar valores
      this.dataForm.get('id_personal').setValue(this._data.row?.nameHolder);
      // this.dataForm.get('id_item').setValue(this._data.row?.nameItem);
      this.dataForm.get('id_item').setValue(this._data.row?.id_item);

      this.dataForm.get('quantity').setValue(this._data.row?.quantity);
      this.dataForm.get('name').setValue(this._data.row?.nameHolder);
      this.dataForm.get('returnDate').setValue(this._data.row?.returnDate);
      this.dataForm.get('typeApplicant').setValue(this._data.row?.holderType);
      this.dataForm.get('dPI').setValue(this._data.row?.dpi);

      // Asignar valores

      if (this._data.action == ActionType.Edit) {
        // Input Desabilitados
        this.dataForm.get('idPersonal').disable();
        // Input Desabilitados 
      }
      if (this._data.action == ActionType.ChangeStatus) {

      }
      if (this._data.action == ActionType.Delete) {

      }
      if (this._data.action == ActionType.View) {

      }
      if (this._data.action == ActionType.Reverse) {
        this.dataForm.get('id_personal').disable();
        this.dataForm.get('id_item').disable();
        this.dataForm.get('quantity').disable();
        this.dataForm.get('name').disable();
        this.dataForm.get('returnDate').disable();
        this.dataForm.get('typeApplicant').disable();
        this.dataForm.get('name').disable();
        this.dataForm.get('dPI').disable();
        this.dataForm.get('description').disable();

        this.onGetUnitProducto();
      }
      else {
        this.dataForm.get('id_personal').disable();
        this.dataForm.get('id_item').disable();
        this.dataForm.get('quantity').disable();
        this.dataForm.get('name').disable();
        this.dataForm.get('returnDate').disable();
        this.dataForm.get('typeApplicant').disable();
        this.dataForm.get('name').disable();
        this.dataForm.get('dPI').disable();
        this.dataForm.get('description').disable();
        
                this.onGetUnitProducto();

      }
    }




  }



  private applyConditionalValidators(type: any) {
    const id_personal = this.dataForm.get('id_personal')!;
    const address = this.dataForm.get('address')!;
    const phoneNumber = this.dataForm.get('phoneNumber')!;
    const dPI = this.dataForm.get('dPI')!;
    const name = this.dataForm.get('name')!;

    // Limpiar validadores
    id_personal.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (this.dataForm.get('typeApplicant').value == 2) {
      id_personal.setValidators([
        Validators.required,
      ]);
      id_personal.enable();

      address.disable();
      address.reset();
      phoneNumber.disable();
      phoneNumber.reset();
      dPI.disable();
      dPI.reset();
      name.disable();
      name.reset();
    }
    else {
      address.setValidators([Validators.required,]);
      address.enable();
      // phoneNumber.setValidators([Validators.required,]);
      // phoneNumber.enable();
      dPI.setValidators([Validators.required, Validators.pattern(/^[0-9]{13}$/)]);
      dPI.enable();
      name.setValidators([Validators.required,]);
      name.enable();
      phoneNumber.enable();
      id_personal.disable();
      id_personal.reset();
    }

    // Re-evaluar estado
    id_personal.updateValueAndValidity();
    address.updateValueAndValidity();
    phoneNumber.updateValueAndValidity();
    dPI.updateValueAndValidity();
    name.updateValueAndValidity();

    if (this._data.action !== ActionType.Create) {
      address.disable();
      // address.reset();
      phoneNumber.disable();
      // phoneNumber.reset();
      dPI.disable();
      // dPI.reset();
      name.disable();
      id_personal.disable();
      // name.reset();

      id_personal.updateValueAndValidity();
      address.updateValueAndValidity();
      phoneNumber.updateValueAndValidity();
      dPI.updateValueAndValidity();
      name.updateValueAndValidity();
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
    const idData = this._data.row?.batchId; //OJO
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

  recieve() {
    const payload = this.dataForm.getRawValue();
    const dataMap = {
      BatchId: this._data.row?.batchId,
      QuantityReturn: payload.quantityReturn
    };
    const idData = this._data.row?.batchId;
    this._generalApi.recieve(this.service, dataMap).subscribe({
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

  onGetUnitProducto() {
    const idData = this.dataForm.get('id_item').value;

    this._generalApi.GetById('UnitItem', idData,).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.unitProduct = response.data.name
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
    else if (this._data.action == ActionType.Receive) {
      this.recieve();
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

  // OnIsInternSelected() {
  //   this.isInterSelected = this.aData1.find((item: any) => item.idDonationType === this.dataForm.get('idDonationType').value)?.isMonetary ?? false;
  // }

}
