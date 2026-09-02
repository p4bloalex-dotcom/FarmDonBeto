import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-calendar-dialog',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    MatTimepickerModule,
  ],
  templateUrl: './calendar-dialog.component.html',
  styleUrl: './calendar-dialog.component.scss'
})
export class CalendarDialogComponent {

  actionDialog: number;
  dataForm: UntypedFormGroup;
  manualForm: UntypedFormGroup;
  iData1: any;
  aData2: any;
  service: string = 'Calendar';
  manual: any = {};
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<CalendarDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {

    this.actionDialog = this._data?.action
    // this.dataForm = this._formBuilder.group({
    //   id: ['', []],
    //   nameShift: ['', []],
    //   startDate: ['', []],
    //   endAt: ['', []],
    //   asignedPersonal: this._formBuilder.array([])
    // });
    this.manualForm = this._formBuilder.group({
      idShiftAttendance: ['', Validators.required],
      arrivedAtUtc: ['', Validators.required],
      leftAtUtc: ['', Validators.required],
      comment: ['']
    });

    // this.aData1 = this._data?.data1; //Turnos
    // this.aData2 = this._data?.data2; //Personal
    // console.log(this.aData2)

    // ----Asignacion de datos extras------//
    if (this._data.action == 1) {
      //Crear
    }
    if (this._data.action == 2) {
      //Editar
      // Asignar valores
      // this.dataForm.get('id_shift').setValue(this._data.row?.idShift);
      // this.dataForm.get('assignedPersonal').setValue(this._data.row?.assignedPersonal);
      // Asignar valores

      // Input Desabilitados
      // this.dataForm.get('status').disable();
      // Input Desabilitados
    }
    if (this._data.action == 3) {
      //Cambiar estado

      // Input Desabilitados

      // Input Desabilitados
    }
    if (this._data.action == 4) {
      //Eliminar

      // Asignar valores
      // Asignar valores

      // Input Desabilitados
      // Input Desabilitados
    }
    if (this._data.action == ActionType.View) {
      const id = this._data?.id;
      this._generalApi.GetById("Calendar", id).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.iData1 = response.data
          } else {
            this._toast.error(response.error.detail);
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
        }
      });
    }
  }


  //   const payload = {
  //     id_shift: this.dataForm.get('id_shift')?.value,
  //     assignedPersonal: this.assignedEmployees.map(e => ({
  //       IdPersonal: e.idPersonal
  //     })),
  //   };

  //   this._generalApi.add(this.service, payload).subscribe({
  //     next: (response: ApiResponse<any>) => {
  //       if (response.success) {
  //         this._matDialogRef.close({ idAction: this._data.action, ...response.data });
  //       } else {
  //         this._toast.error(response.error.detail);
  //       }
  //     },
  //     error: (error) => {
  //       this._toast.error('Error inesperado. Intenta más tarde.');
  //     }
  //   });
  // }

  // edit() {
  //   const payload = this.dataForm.getRawValue();
  //   const idData = this._data.row?.idPersonal; //OJO
  //   this._generalApi.modify(this.service, idData, payload).subscribe({
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

  // changeStatus() {
  //   const payload = this.dataForm.getRawValue();
  //   const idData = this._data.row?.idPersonal;
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
  //   const idData = this._data.row?.idPersonal;//OJO
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

  // removeEmployee(emp: any) {
  //   this.assignedEmployees = this.assignedEmployees.filter(
  //     (e) => e.idPersonal !== emp.idPersonal
  //   );
  // }

  // addEmployee() {
  //   const empId = this.dataForm.get('selectedEmployee')?.value;
  //   if (empId) {
  //     const emp = this.aData2.find((e) => e.idPersonal === empId);
  //     if (emp && !this.assignedEmployees.find((x) => x.idPersonal === emp.idPersonal)) {
  //       this.assignedEmployees.push(emp);
  //     }
  //     this.dataForm.get('selectedEmployee')?.reset();
  //   }
  // }





  // -----METODOS DEL DIALOG------//
  save() {
    if (this.manualForm.invalid) return;

    if (this._data.action == ActionType.Create) {
      // this.create();
    } else if (this._data.action == ActionType.Edit) {
      // this.edit();
    }
    else if (this._data.action == ActionType.ChangeStatus) {
      //3
      // this.changeStatus();
    }
    else if (this._data.action == ActionType.Delete) {
      // this.delete();
    }
    else if (this._data.action == ActionType.View) {

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

  openManualAttendance(personal: any) {
    this.manualForm.patchValue({
      idShiftAttendance: personal.idShiftAttendance,
      arrivedAtUtc: personal.arrivedAtUtc || '',
      leftAtUtc: personal.leftAtUtc || '',
      comment: ''
    });
    this.actionDialog = 99;
    console.log("Form inicializado:", this.manualForm.value);
  }

  saveManualAttendance() {
    const payload = this.manualForm.value;
    if (this.manualForm.invalid) return;
    this._generalApi.add(this.service, payload).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._toast.success("Asistencia registrada manualmente.");
          this._matDialogRef.close({
            idAction: 99,
            ...payload
          });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: () => {
        this._toast.error("Error inesperado. Intenta más tarde.");
      }
    });
  }


  cancelManualAttendance() {
    this.actionDialog = this._data?.action;
  }

  replaceShift(personal: any): void {
    const payload = {
      idShiftAttendance: personal.idShiftAttendance,
      arrivedAtUtc: null,
      leftAtUtc: null,
      comment: null
    }
    this._generalApi.add(this.service+"/replacement", personal).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this._toast.success("Reemplazo de turno realizado correctamente");
          this._matDialogRef.close({
            idAction: ActionType.Replacement,
            ...payload
          });
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: () => {
        this._toast.error("Error inesperado. Intenta más tarde.");
      }
    });
  }


}
