import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-audit-detail-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './audit-detail-dialog.component.html'
})
export class AuditDetailDialogComponent {
  detail: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private _dialogRef: MatDialogRef<AuditDetailDialogComponent>
  ) {
    this.detail = data?.detail ?? {};
  }

  close(): void {
    this._dialogRef.close();
  }

  pretty(value: any): string {
    if (!value) return 'Sin datos';
    if (typeof value !== 'string') return JSON.stringify(value, null, 2);
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
}
