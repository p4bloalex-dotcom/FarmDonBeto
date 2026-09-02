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
import { FingerApiService } from 'app/core/services/finger-api.service';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-enrollfinger-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCheckboxModule,
  ],
  templateUrl: './enrollfinger-dialog.component.html',
  styleUrl: './enrollfinger-dialog.component.scss'
})
export class EnrollfingerDialogComponent {





  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service: string = 'EnrollFinger';

  samples: string[] = [];
  currentCapture: number = 0;
  totalCaptures: number = 4;

  private _unsubscribeAll = new Subject<void>()
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<EnrollfingerDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _fingerApi: FingerApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {

    // this._fingerApi.checkStatus().subscribe((status: ApiResponse<any>) => {
    //   if (status.success == false) {
    //     this._toast.error(status.error);
    //     this._matDialogRef.close();
    //     return;
    //   }

    //   this._fingerApi.getDevices().subscribe((devices: ApiResponse<any>) => {
    //     if (devices.success == false) {
    //       this._toast.error(devices.error);
    //       this._matDialogRef.close();
    //       return;
    //     }
    //   });
    // });

    this._fingerApi.checkStatus().subscribe({
      next: (result: ApiResponse<any>) => {
        if (!result.success) {
          this._toast.error('No se detecta el programa local de huellas.');
          this._matDialogRef.close();
          return;
          return;
        }

        this._fingerApi.getDevices().subscribe({
          next: (result: ApiResponse<any>) => {
            if (!result.success) {
              this._toast.error('No hay lector biométrico conectado.');
              this._matDialogRef.close();
              return;
            }
          },
          error: () => {
            this._toast.error('Error al comunicarse con el lector biométrico.');
            this._matDialogRef.close();
            return;
          }
        });
      },

      error: () => {
        this._toast.error('El servicio local de huellas no está en ejecución.');
        this._matDialogRef.close();
        return;
      }
    });




    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      idPersonal: ['', [Validators.required],],
      idfingertype: ['', [Validators.required],],
      deviceId: ['', [],],
      status: ['E', [Validators.required],],
    });

    this.aData1 = this._data?.data1;
    this.aData2 = this._data?.data2;

    // ----Asignacion de datos extras------//

    // ----Asignacion de datos extras------//
    if (this._data.action == ActionType.Create) {
      //Crear
    }
    if (this._data.action !== ActionType.Create) {
      //Editar
      // Asignar valores
      this.dataForm.get('idPersonal').setValue(this._data.row?.idPersonal);
      this.dataForm.get('idfingertype').setValue(this._data.row?.idfingertype);
      this.dataForm.get('status').setValue(this._data.row?.status);
      // Asignar valores

      if (this._data.action == ActionType.Edit) {
        // Input Desabilitados
        this.dataForm.get('idPersonal').disable();
        this.dataForm.get('idfingertype').disable();
        this.dataForm.get('status').disable();
        // Input Desabilitados 
      }
      if (this._data.action == ActionType.Delete) {
        this.dataForm.get('idPersonal').disable();
        this.dataForm.get('idfingertype').disable();
        this.dataForm.get('status').disable();
      }
    }
  }

  create() {
    if (this.samples.length < this.totalCaptures) {
      this._toast.warning('Debe capturar las 4 muestras antes de guardar.');
      return;
    }
    const formData = this.dataForm.getRawValue();
    const payload = {
      idPersonal: formData.idPersonal,
      idfingertype: formData.idfingertype,
      deviceId: 'UareU-Local',
      samples: this.samples
    };

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
    const idData = this._data.row?.idFingerprintEnrollment; //OJO
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
    const idData = this._data.row?.idFingerprintEnrollment; //OJO
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
    const idData = this._data.row?.idFingerprintEnrollment;//OJO
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


  async captureSample() {
    if (this.dataForm.invalid) {
      this._toast.warning('Complete los campos requeridos antes de capturar.');
      return;
    }

    if (this.currentCapture >= this.totalCaptures) {
      this._toast.info('Ya se capturaron todas las muestras.');
      return;
    }

    const formData = this.dataForm.getRawValue();
    this._toast.info(`Coloque el dedo (${this.currentCapture + 1}/${this.totalCaptures})...`);

    try {
      const result: ApiResponse<any> = await firstValueFrom(this._fingerApi.captureFingerprint().pipe(takeUntil(this._unsubscribeAll)));
      console.log(result)
      if (result.success) {
        // const cleanBase64 = result.data.replace(/^data:image\/png;base64,/, '');
        this.samples.push(result.data);
        this.currentCapture++;
        this._toast.success(`Muestra ${this.currentCapture}/${this.totalCaptures} capturada correctamente.`);
      } else {
        this._toast.error(result.error || 'Error en la captura.');
      }
    } catch (err) {
      if (err?.message?.includes('cancelada')) {
        this._toast.info('Captura cancelada.');
      } else {
        this._toast.error('No se pudo capturar la huella. Asegúrese que el lector esté conectado.');
      }
    }
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    this._fingerApi.CancelCapture().subscribe({
      next: () => console.log('Captura cancelada.'),
      error: err => console.warn('Error cancelando captura:', err)
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
      //3
      this.delete();
    }
  }

  close() {
    this._fingerApi.CancelCapture().subscribe({
      next: () => this._toast.info('Captura cancelada.'),
      error: () => console.warn('No se pudo detener la captura.')
    });
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
