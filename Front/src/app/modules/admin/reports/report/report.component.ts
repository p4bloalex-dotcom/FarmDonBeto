import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
  selector: 'app-report',
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
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  actionDialog: number;
  dataForm: UntypedFormGroup;
  aData1: any;
  aData2: any;
  service: string = 'Report';
  private _unsubscribeAll = new Subject<void>()

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
  ) { }

  ngOnInit() {
    this.dataForm = this._formBuilder.group({
      reportType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],

      status: [''],
    });
    this.dataForm.get('reportType')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('reportType')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: any) => this.applyConditionalValidators(type));
  }





    private applyConditionalValidators(data: any) {
    const status = this.dataForm.get('status')!;


    // Limpiar validadores
    status.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (data == 2) {
      status.setValidators([ Validators.required,]);
      status.enable();
      // iBreak.setValue(iDuration.value)

      // iInterval.disable();
      // iInterval.reset();
      // iDays.disable();
      // iDays.reset();
    }
    else if (data == 3) {
      status.disable();
      status.reset();
    }
    else if (data == 1) {
    }
    else {
    }

    // Re-evaluar estado
    status.updateValueAndValidity();
  }




  getFile() {
      const raw = this.dataForm.getRawValue();    
      const payload = {
        ...raw,
        startDate: this.formatDate(raw.startDate),
        endDate: this.formatDate(raw.endDate),
      };

    this._generalApi.downloadReport(this.service, payload).subscribe({
      next: (response) => {
          const blob = response.body!;
          const contentDisp = response.headers.get('content-disposition') || '';
          let filename = '';
          const starMatch = contentDisp.match(/filename\*\s*=\s*([^']*)''([^;]+)/i);
          if (starMatch && starMatch[2]) {
              filename = decodeURIComponent(starMatch[2]);
          } else {
              const nameMatch = contentDisp.match(/filename="?([^";]+)"?/i);
              if (nameMatch && nameMatch[1]) {
                  filename = nameMatch[1];
              }
          }
          if (!filename) {
              filename = `archivo sin nombre.pdf`;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      },
      error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
      }
  });
  }


  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; 
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  // -----METODOS DEL DIALOG------//
  save() {
    if (this.dataForm.invalid) return;
    const startAt = this.dataForm.get('startDate').value;
    const endAt = this.dataForm.get('endDate').value;
    if (startAt> endAt) {
      this._toast.error('Filtro de fecha no permitida.');
      return
    }
    this.getFile();
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
