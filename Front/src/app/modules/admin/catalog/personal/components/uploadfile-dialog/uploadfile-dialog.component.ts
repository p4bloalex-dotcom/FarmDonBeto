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
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
    selector: 'app-uploadfile-dialog',
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
    templateUrl: './uploadfile-dialog.component.html',
    styleUrl: './uploadfile-dialog.component.scss'
})
export class UploadfileDialogComponent {

  dataForm: UntypedFormGroup;
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  aData: any;
  aData1: any;
  aData2: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<UploadfileDialogComponent>,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) {
    this.dataForm = this.fb.group({
      idPersonal :['',],
      idTypeDocument: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  ngOnInit() {
    const m1 = (this._data?.data1 as Map<number, string> | undefined) ?? new Map();
    const m2 = (this._data?.data2 as Map<number, string> | undefined) ?? new Map();

    this.aData1 = [...m1].map(([id, name]) => ({ id, name }));
    this.aData2 = [...m2].map(([id, name]) => ({ id, name }));

    this._generalApi.GetById("PersonalDocumentsRequeriment", this._data.row.idPersonal).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.aData = response.data
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFile = file;
    this.dataForm.patchValue({ file });

    const reader = new FileReader();
    reader.onload = () => this.filePreview = reader.result;
    if (this.isImage(file)) reader.readAsDataURL(file);
  }

  isImage(file: File) {
    return file.type.startsWith('image/');
  }

  submit() {
    if (this.dataForm.invalid) return;
    const fd = new FormData();
    fd.append('idPersonal',  this._data.row.idPersonal);
    fd.append('idTypeDocument', this.dataForm.value.idTypeDocument);
    fd.append('file', this.selectedFile!);

    this._generalApi.uploadFormDataFile("Personal", fd).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.dialogRef.close();
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



  close() {
    this.dialogRef.close();
  }


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
