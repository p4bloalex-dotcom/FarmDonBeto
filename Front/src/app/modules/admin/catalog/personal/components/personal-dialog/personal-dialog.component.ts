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
  selector: 'app-personal-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatIcon,
    MatDialogModule
  ],
  templateUrl: './personal-dialog.component.html',
  styleUrl: './personal-dialog.component.scss'
})
export class PersonalDialogComponent {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service: string = 'Personal';
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<PersonalDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {

    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      first_name: ['', [Validators.required],],
      middle_name: ['', [],],
      other_names: ['',],
      last_name: ['', [Validators.required],],
      second_lastname: ['', [],],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)],],
      gender: ['', [Validators.required],],
      email: ['', [Validators.required, Validators.email],],
      status: ['', [Validators.required],],
      company_id: ['', [Validators.required],]
    });

    // ----Asignacion de datos extras------//
    const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
    // const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();

    this.aData1 = [...m1].map(([id, name]) => ({ id, name }));
    // this.aData2 = [...m2].map(([id, name]) => ({ id, name }));

    console.log(this.aData1)
    // ----Asignacion de datos extras------//
    if (this._data.action == 1) {
      //Crear
    }
    if (this._data.action == 2) {
      //Editar
      // Asignar valores
      this.dataForm.get('first_name').setValue(this._data.row?.first_name);
      this.dataForm.get('middle_name').setValue(this._data.row?.middle_name);
      this.dataForm.get('other_names').setValue(this._data.row?.other_names);
      this.dataForm.get('last_name').setValue(this._data.row?.last_name);
      this.dataForm.get('second_lastname').setValue(this._data.row?.second_lastname);
      this.dataForm.get('phone').setValue(this._data.row?.phone);
      this.dataForm.get('gender').setValue(this._data.row?.gender);
      this.dataForm.get('email').setValue(this._data.row?.email);
      this.dataForm.get('status').setValue(this._data.row?.status);
      this.dataForm.get('company_id').setValue(this._data.row?.company_id);
      // Asignar valores

      // Input Desabilitados
      this.dataForm.get('status').disable();
      this.dataForm.get('company_id').disable();
      // Input Desabilitados
    }
    if (this._data.action == 3) {
      //Cambiar estado

      this.dataForm.get('first_name').setValue(this._data.row?.first_name);
      this.dataForm.get('middle_name').setValue(this._data.row?.middle_name);
      this.dataForm.get('other_names').setValue(this._data.row?.other_names);
      this.dataForm.get('last_name').setValue(this._data.row?.last_name);
      this.dataForm.get('second_lastname').setValue(this._data.row?.second_lastname);
      this.dataForm.get('phone').setValue(this._data.row?.phone);
      this.dataForm.get('gender').setValue(this._data.row?.gender);
      this.dataForm.get('email').setValue(this._data.row?.email);
      this.dataForm.get('status').setValue(this._data.row?.status);
      this.dataForm.get('company_id').setValue(this._data.row?.company_id);

      // Input Desabilitados
      this.dataForm.get('first_name').disable();
      this.dataForm.get('middle_name').disable();
      this.dataForm.get('other_names').disable();
      this.dataForm.get('last_name').disable();
      this.dataForm.get('second_lastname').disable();
      this.dataForm.get('phone').disable();
      this.dataForm.get('gender').disable();
      this.dataForm.get('email').disable();
      this.dataForm.get('status').disable();
      this.dataForm.get('company_id').disable();
      // Input Desabilitados
    }
    if (this._data.action == 4) {
      //Eliminar

      // Asignar valores
      this.dataForm.get('first_name').setValue(this._data.row?.first_name);
      this.dataForm.get('middle_name').setValue(this._data.row?.middle_name);
      this.dataForm.get('other_names').setValue(this._data.row?.other_names);
      this.dataForm.get('last_name').setValue(this._data.row?.last_name);
      this.dataForm.get('second_lastname').setValue(this._data.row?.second_lastname);
      this.dataForm.get('phone').setValue(this._data.row?.phone);
      this.dataForm.get('gender').setValue(this._data.row?.gender);
      this.dataForm.get('email').setValue(this._data.row?.email);
      this.dataForm.get('status').setValue(this._data.row?.status);
      this.dataForm.get('company_id').setValue(this._data.row?.company_id);
      // Asignar valores

      // Input Desabilitados
      this.dataForm.get('first_name').disable();
      this.dataForm.get('middle_name').disable();
      this.dataForm.get('other_names').disable();
      this.dataForm.get('last_name').disable();
      this.dataForm.get('second_lastname').disable();
      this.dataForm.get('phone').disable();
      this.dataForm.get('gender').disable();
      this.dataForm.get('email').disable();
      this.dataForm.get('status').disable();
      this.dataForm.get('company_id').disable();
      // Input Desabilitados
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
    const idData = this._data.row?.id; //OJO
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
    const idData = this._data.row?.id;
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
    const idData = this._data.row?.id;//OJO
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

  uploadImage(fileList: FileList): void {
    if (!fileList.length) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    const file = fileList[0];

    if (!allowedTypes.includes(file.type)) {
      return;
    }
    this._readAsDataURL(file).then((data) => {
      this.dataForm.get('picture').setValue(data)
      this.dataForm.get('pictureTemp').setValue(data)
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

}
