import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-inventory-edit-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './inventory-edit-dialog.component.html',
  styleUrl: './inventory-edit-dialog.component.scss'
})
export class InventoryEditDialogComponent implements OnInit {
  dataForm: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _matDialogRef: MatDialogRef<InventoryEditDialogComponent>,
    private _formBuilder: UntypedFormBuilder,
    private _generalApi: GeneralApiService,
    private _toast: HotToastService
  ) { }

  ngOnInit(): void {
    const row = this.data.row;
    this.dataForm = this._formBuilder.group({
      reserve: [row.reserve ?? 0, [Validators.required, Validators.min(0)]],
      stockMin: [row.stockMin ?? 0, [Validators.required, Validators.min(0)]],
      stockMax: [row.stockMax ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    const payload = this.dataForm.getRawValue();
    this._generalApi.modify('Inventory', this.data.row.id, payload).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this._matDialogRef.close(resp.data) : this._toast.error(resp.error?.detail ?? 'No se pudo actualizar inventario.'),
      error: () => this._toast.error('Error inesperado al actualizar inventario.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }
}
