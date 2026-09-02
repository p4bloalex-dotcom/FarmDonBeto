import { NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@fuse/components/hot-toast';
import { CellFormatPipe } from '@fuse/pipes/cellFormatPipe.pipe';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-auditdetail-dialog',
  imports: [NgClass,         CellFormatPipe,
  ],
  templateUrl: './auditdetail-dialog.component.html',
  styleUrl: './auditdetail-dialog.component.scss'
})
export class AuditdetailDialogComponent {
  detail: any = null;
  dataUser: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<AuditdetailDialogComponent>,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }



  ngOnInit() {
    this.dataUser = this._data.data1;
    this._generalApi.GetById("Audit", this._data.row.id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          // this.aData = response.data
          this.detail = response.data
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
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

getValueInMap(id: number): string | undefined {
  return this.dataUser.get(id);
}

  

}
