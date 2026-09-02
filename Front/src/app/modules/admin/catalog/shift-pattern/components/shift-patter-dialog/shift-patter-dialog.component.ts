import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
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
import { MatTimepickerModule, MatTimepickerToggle } from '@angular/material/timepicker';
import { startWith, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-shift-patter-dialog',
  imports: [
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
  templateUrl: './shift-patter-dialog.component.html',
  styleUrl: './shift-patter-dialog.component.scss'
})
export class ShiftPatterDialogComponent {


  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  private _unsubscribeAll = new Subject<void>()
  service: string = 'ShiftPattern';
  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _matDialogRef: MatDialogRef<ShiftPatterDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.actionDialog = this._data?.action
    this.dataForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      // date_start: ['', [Validators.required]],
      date_start: new FormControl<Date | null>(null, [Validators.required]),

      // date_end: ['', []],
      time_start: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      break: ['', []],

      // break: new FormControl<Date | null>(null, []),
      recurrence: ['', []],
      interval: [null, []],
      days: [null, []],
      is_required: [false, []],
      allow_replacement: [false, []],
      min_staff: ['', []],
      max_staff: ['', []],
      status: ['E', []],

      //Cumplieminto
      period: [0, []],
    });

    this.dataForm.get('recurrence')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('recurrence')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: any) => this.applyConditionalValidators(type));

    // ----Asignacion de datos extras------//
    // ----Asignacion de datos extras------//
    if (this._data.action == 1) {
      //Crear
    }
    if (this._data.action != 1) {
      //Editar
      // Asignar valores
      this.dataForm.get('name').setValue(this._data.row?.name);

      const dateStr = this._data.row?.date_start;
      const [year, month, day] = dateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      this.dataForm.get('date_start').setValue(localDate);

      // this.dataForm.get('date_end').setValue(this._data.row?.date_end);
      this.dataForm.get('time_start').setValue(this._data.row?.time_start);
      this.dataForm.get('duration').setValue(this._data.row?.duration);
      this.dataForm.get('break').setValue(this._data.row?.break);
      this.dataForm.get('recurrence').setValue(this._data.row?.recurrence);
      this.dataForm.get('interval').setValue(this._data.row?.interval);
      this.dataForm.get('days').setValue(this._data.row?.days);
      this.dataForm.get('is_required').setValue(this._data.row?.is_required);
      this.dataForm.get('allow_replacement').setValue(this._data.row?.allow_replacement);
      this.dataForm.get('min_staff').setValue(this._data.row?.min_staff);
      this.dataForm.get('max_staff').setValue(this._data.row?.max_staff);
      this.dataForm.get('status').setValue(this._data.row?.status);
      this.dataForm.get('period').setValue(this._data.row?.period);
      // Asignar valores

      if (this._data.action != ActionType.Edit) {
        this.dataForm.get('name').disable();
        this.dataForm.get('date_start').disable();
        // this.dataForm.get('date_end').disable();
        this.dataForm.get('time_start').disable();
        this.dataForm.get('duration').disable();
        this.dataForm.get('break').disable();
        this.dataForm.get('recurrence').disable();
        this.dataForm.get('interval').disable();
        this.dataForm.get('is_required').disable();
        this.dataForm.get('allow_replacement').disable();
        this.dataForm.get('min_staff').disable();
        this.dataForm.get('allow_replacement').disable();
        this.dataForm.get('max_staff').disable();
        this.dataForm.get('status').disable();
      }
      if (this._data.action == ActionType.ChangeStatus) {
        this.dataForm.get('status').enable();
      }
      if (this._data.action == ActionType.Edit) {
        //this.dataForm.get('name').disable();
        this.dataForm.get('is_required').disable();
        //this.dataForm.get('allow_replacement').disable();
        this.dataForm.get('min_staff').disable();
        this.dataForm.get('allow_replacement').disable();
        this.dataForm.get('max_staff').disable();
        this.dataForm.get('status').disable();

      }
      else {
        // Input Desabilitados
        // this.dataForm.get('status').disable();
        // Input Desabilitados
      }
      this.dataForm.get('break').disable();
    }
  }


  private applyConditionalValidators(data: any) {
    const iBreak = this.dataForm.get('break')!;
    const iInterval = this.dataForm.get('interval')!;
    const iDays = this.dataForm.get('days')!;
    const iDuration = this.dataForm.get('duration')!;
    const time_start = this.dataForm.get('time_start')!;
    const period = this.dataForm.get('period')!;


    // Limpiar validadores
    iBreak.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (data == 2) {
      iBreak.setValidators([Validators.required,]);
      iBreak.enable();
      // iBreak.setValue(iDuration.value)

      iInterval.disable();
      iInterval.reset();
      iDays.disable();
      iDays.reset();
    }
    else if (data == 3) {
      iInterval.setValidators([Validators.required,]);
      iInterval.enable();
      iDays.setValidators([Validators.required,]);
      iDays.enable();
      iBreak.disable();
      iBreak.reset();
    }
    else if (data == 1) {
      iInterval.setValidators([Validators.required,]);
      iInterval.enable();
      iBreak.disable();
      iBreak.reset();
      iDays.disable();
      iDays.reset();
    }
    else if (data == 6) {
      period.setValidators([Validators.required,]);
      period.enable();
      time_start.setValidators(null);
      time_start.enable();
      iBreak.disable();
      iBreak.reset();
      iDays.disable();
      iDays.reset();
    }
    else {
      iBreak.disable();
      iBreak.reset();
      iInterval.disable();
      iInterval.reset();
      iDays.disable();
      iDays.reset();
    }

    // Re-evaluar estado
    iBreak.updateValueAndValidity();
    iInterval.updateValueAndValidity();
    iDays.updateValueAndValidity();

  }


  create() {
    const payload = this.dataForm.getRawValue();
    const date = this.dataForm.value.date_start;
    payload.date_start = date ? date.toISOString().split('T')[0] : null;
    payload.time_start = this.normalizeTime(this.dataForm.value.time_start);
    payload.duration = this.normalizeTime(this.dataForm.value.duration);
    payload.break = this.normalizeTime(this.dataForm.value.break);
    payload.min_staff = this.dataForm.value.min_staff || null;
    payload.max_staff = this.dataForm.value.max_staff || null;

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
    const date = this.dataForm.value.date_start;
    payload.date_start = date ? date.toISOString().split('T')[0] : null;
    payload.time_start = this.normalizeTime(this.dataForm.value.time_start);

    const idData = this._data.row?.id_shift; //OJO
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
    const idData = this._data.row?.id_shift;
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
    const idData = this._data.row?.id_shift;//OJO
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


  get recurrenceType() {
    return this.dataForm.get('recurrence')?.value;
  }

  showInterval(): boolean {
    return this.recurrenceType === 1
      || this.recurrenceType === 3;
  }

  showBreak(): boolean {
    return this.recurrenceType === 2;
  }

  showDays(): boolean {
    return this.recurrenceType === 3;
  }


  showHourRequired(): boolean {
    return this.recurrenceType === 6;
  }

  showPeriod(): boolean {
    return this.recurrenceType === 6;
  }

  // showDuration(): boolean {
  //   return this.recurrenceType ! 6;
  // }

  showReplacement(): boolean {
    return this.recurrenceType != 6;
  }

  //Agregar los segundos a la hora
  normalizeTime(value: string): string | null {
    return value ? (value.length === 5 ? value + ':00' : value) : null;
  }
}
