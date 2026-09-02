import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { startWith, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-personal',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatExpansionModule,
        DatePipe,
        MatIconModule
    ],
    templateUrl: './personal.component.html',
    styleUrl: './personal.component.scss'
})
export class PersonalComponent {

    dataForm: UntypedFormGroup;
    axData1: any ;
    private _unsubscribeAll = new Subject<void>()
    constructor(private _formBuilder: UntypedFormBuilder,
      private _generalApi: GeneralApiService,
      private _toast: HotToastService,) {
    }
    
    ngOnInit() {
      this.dataForm = this._formBuilder.group({
        typeSearch: ['', [Validators.required],],
        dpi: ['', [],],
        firstName: ['', [],],
        lastName: ['', [],],
      });


    this.dataForm.get('typeSearch')!.valueChanges
      .pipe(
        startWith(this.dataForm.get('typeSearch')!.value),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((type: number) => this.applyConditionalValidators(type));
    }
  
    find() {
      const payload = this.dataForm.getRawValue();
      this._generalApi.GetBySearch("PersonalQ", payload).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.axData1 = response.data
          } else {
            this._toast.error(response.error.detail);
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
        }
      });
    }


 private applyConditionalValidators(type: number) {
    const dpi       = this.dataForm.get('dpi')!;
    const firstName = this.dataForm.get('firstName')!;
    const lastName  = this.dataForm.get('lastName')!;

    // Limpiar validadores
    dpi.clearValidators();
    firstName.clearValidators();
    lastName.clearValidators();

    // Habilitar/deshabilitar controles según tipo
    if (type === 1) {
      dpi.setValidators([
        Validators.required,
        Validators.pattern(/^\d{13}$/)
      ]);
      dpi.enable();
      firstName.disable();
      lastName.disable();
    }
    else if (type === 2) {
      firstName.setValidators([Validators.required]);
      lastName.setValidators([Validators.required]);
      firstName.enable();
      lastName.enable();
      dpi.disable();
    }
    else {
      // Si es otro valor, todos habilitados pero sin validadores
      dpi.enable();
      firstName.enable();
      lastName.enable();
    }

    // Re-evaluar estado
    dpi.updateValueAndValidity();
    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  onGetDocument(data:any){
    this._generalApi.downloadFile('personalQ',data.idPersonalDocu).subscribe({
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
  


  
    
}
