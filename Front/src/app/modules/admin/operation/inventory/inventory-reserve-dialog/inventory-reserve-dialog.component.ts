import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-inventory-reserve-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './inventory-reserve-dialog.component.html'
})
export class InventoryReserveDialogComponent implements OnInit {
  dataForm: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _matDialogRef: MatDialogRef<InventoryReserveDialogComponent>,
    private _formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.dataForm = this._formBuilder.group({
      quantity: [1, [Validators.required, Validators.min(0.01), Validators.max(Number(this.data.row.stockAvailable ?? 0))]]
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    this._matDialogRef.close(this.dataForm.getRawValue());
  }

  close(): void {
    this._matDialogRef.close();
  }
}
