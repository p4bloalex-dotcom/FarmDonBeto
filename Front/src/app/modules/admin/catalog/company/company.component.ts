import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { HotToastService } from '@fuse/components/hot-toast';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIcon } from "@angular/material/icon";
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';

@Component({
  selector: 'app-company',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIcon
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent {
  dataForm: UntypedFormGroup;
  aData1: any[] = [];
  aData2: any[] = [];

  constructor(private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,) {
  }

  ngOnInit() {
    this.getList();
    this.dataForm = this._formBuilder.group({
      name: ['', [Validators.required],],
      id_department: ['', [Validators.required],],
      id_municipality: ['', [Validators.required],],
      address: ['', [],],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8,11}$/)],],
      email: ['', [Validators.required, Validators.email],],
      logo: ['', [Validators.required],]
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
      this.dataForm.get('logo').setValue(data)
    });
  }


  save() {
    const payload = this.dataForm.getRawValue();
    this._generalApi.add("Company", payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._toast.success("Operacion exitosa");
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  getList(): void {
    const endpoints = ['Department', 'Company/findByUser'];
    this._generalApi.comboList(endpoints)
      .subscribe({
        next: ([data1, data2]) => {
          this.aData1 = data1;
          this.dataForm.get('name').setValue(data2?.name);
          this.dataForm.get('id_department').setValue(data2?.id_department);
          this.dataForm.get('id_municipality').setValue(data2?.id_municipality);
          this.dataForm.get('address').setValue(data2?.address);
          this.dataForm.get('phone').setValue(data2?.phone);
          this.dataForm.get('email').setValue(data2?.email);
          this.dataForm.get('logo').setValue(data2?.logo);
          this.onDepartmentSelected(data2?.id_department);
        },
        error: err => {
          this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
        }
      });
  }

  onDepartmentSelected(event: MatSelectChange | number): void {

    let idData: number;
    if (event instanceof MatSelectChange) {
      idData = event.value as number;
    } else {
      idData = event;
    }

    this._generalApi.GetById("Municipality", idData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.aData2 = response.data
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
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


  trackByFn(index: number, item: any): any {
    return item.id || index;
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
