import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    selector: 'app-donation-dialog',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatPaginatorModule,
        MatCheckboxModule,
    ],
    templateUrl: './donation-dialog.component.html',
    styleUrl: './donation-dialog.component.scss'
})
export class DonationDialogComponent {


  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service: string = 'Donation';
  private _unsubscribeAll = new Subject<void>()
  isIdDonationType: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<DonationDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      idDonationType: ['', [Validators.required],],
      idDonorsType: ['', [Validators.required],],
      amount: ['', []],
      description: ['', [],],
      nameDonor: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{8}$/)],],
      address: ['', [],],
      allowInventory: [false, [],],
      status: ['E', [],]
    });

        this.dataForm.get('idDonationType')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('idDonationType')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: number) => this.applyConditionalValidators(type));

    // ----Asignacion de datos extras------//
    // const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
    // const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();

    this.aData1 = this._data?.data1;
    this.aData2 = this._data?.data2;
    // ----Asignacion de datos extras------//
    if (this._data.action == ActionType.Create) {
      //Crear
      this.dataForm.get('status').setValue("E");
      this.dataForm.get('status').disable();
    }
    if (this._data.action !== ActionType.Create) {
      //Editar
      // Asignar valores
      this.dataForm.get('idDonationType').setValue(this._data.row?.idDonationType);
      this.dataForm.get('idDonorsType').setValue(this._data.row?.idDonorsType);
      this.dataForm.get('amount').setValue(this._data.row?.amount);
      this.dataForm.get('description').setValue(this._data.row?.description);
      this.dataForm.get('nameDonor').setValue(this._data.row?.nameDonor);
      this.dataForm.get('phoneNumber').setValue(this._data.row?.phoneNumber);
      this.dataForm.get('address').setValue(this._data.row?.address);
      this.dataForm.get('allowInventory').setValue(this._data.row?.allowInventory);
      this.dataForm.get('status').setValue(this._data.row?.status);
      // Asignar valores

      if (this._data.action == ActionType.Edit) {
        // Input Desabilitados
        this.dataForm.get('idDonationType').disable();
        // Input Desabilitados 
      }
      if (this._data.action == ActionType.ChangeStatus) {
        this.dataForm.get('idDonationType').disable();
        this.dataForm.get('idDonorsType').disable();
        this.dataForm.get('amount').disable();
        this.dataForm.get('description').disable();
        this.dataForm.get('nameDonor').disable();
        this.dataForm.get('phoneNumber').disable();
        this.dataForm.get('address').disable();
        this.dataForm.get('allowInventory').disable();
      }
      if (this._data.action == ActionType.Delete) {
        this.dataForm.get('name').disable();
        this.dataForm.get('status').disable();
        this.dataForm.get('isMonetary').disable();
      }
      if (this._data.action == ActionType.View) {
        this.dataForm.get('idDonationType').disable();
        this.dataForm.get('idDonorsType').disable();
        this.dataForm.get('amount').disable();
        this.dataForm.get('description').disable();
        this.dataForm.get('nameDonor').disable();
        this.dataForm.get('phoneNumber').disable();
        this.dataForm.get('address').disable();
        this.dataForm.get('allowInventory').disable();
        this.dataForm.get('status').disable();

      }
    }




  }


  
 private applyConditionalValidators(type: number) {
    this.OnIsMonetarySelected()
    const amount       = this.dataForm.get('amount')!;
    const description = this.dataForm.get('description')!;

    // Limpiar validadores
    amount.clearValidators();
    description.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (this.isIdDonationType) {
      amount.setValidators([
        Validators.required,
         Validators.pattern(/^\d+(\.\d+)?$/)
      ]);
      amount.enable();
      description.disable();
      description.reset();
    }
    else {
      description.setValidators([Validators.required]);
      description.enable();
      amount.disable();
      amount.reset();
    }

    // Re-evaluar estado
    amount.updateValueAndValidity();
    description.updateValueAndValidity();
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
    const idData = this._data.row?.idDonation; //OJO
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
    const idData = this._data.row?.idDonation; //OJO
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
    const idData = this._data.row?.idDonation;//OJO
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


   OnIsMonetarySelected() {
    this.isIdDonationType = this.aData1.find((item: any) => item.idDonationType === this.dataForm.get('idDonationType').value)?.isMonetary ?? false;
  }

}
