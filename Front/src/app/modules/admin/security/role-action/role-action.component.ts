import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { NgFor } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-role-action',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatExpansionModule,
        MatCheckboxModule,
    ],
    templateUrl: './role-action.component.html',
    styleUrl: './role-action.component.scss'
})
export class RoleActionComponent {
  dataForm: UntypedFormGroup;
  axData1: any[] = [];
  aPermission:any[]= [];
  modifiedPermissions: any[] = [];

  constructor(private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,) {
  }
  
  ngOnInit() {
    this.getList();
    this.dataForm = this._formBuilder.group({
      idRole: ['', [Validators.required],],
    });
  }

  find() {
    const payload = this.dataForm.getRawValue();
    this._generalApi.GetById("Role", payload.idRole).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.aPermission = response.data.categories
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

onPermisoChange(data: any): void {
    const existingIndex = this.modifiedPermissions.findIndex(p => p.idRolePermission === data.idRolePermission);
    const newPermission: any = {
      idRolePermission: data.idRolePermission,
      roleId: data.idRole,
      permissionId: data.permissionId,
      isCheck: data.isCheck,
      isGlobal: data.isGlobal ?? false
    };
    if (existingIndex > -1) {
      this.modifiedPermissions[existingIndex] = newPermission;
    } else {
      this.modifiedPermissions.push(newPermission);
    }
  }

  getList(): void {
    const endpoints = ['Role'];
    this._generalApi.comboList(endpoints)
      .subscribe({
        next: ([data1]) => {
          this.axData1 = data1;
        },
        error: err => {
          this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
        }
    });
  }

  savePermission(){
    this._generalApi.add("RoleAction", this.modifiedPermissions).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
            this._toast.success(response.data);
            this.modifiedPermissions = [];
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


}
