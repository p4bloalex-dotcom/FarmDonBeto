import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@fuse/components/hot-toast';
import { GeneralApiService } from 'app/core/services/general-api.service';

@Component({
  selector: 'app-sale-detail-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './sale-detail-dialog.component.html'
})
export class SaleDetailDialogComponent {
  rows: any[] = [];
  sale: any = {};
  filters: any = {};
  title = 'Detalle de ventas';

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private _dialogRef: MatDialogRef<SaleDetailDialogComponent>,
    private _api: GeneralApiService,
    private _toast: HotToastService
  ) {
    this.rows = data?.rows ?? [];
    this.sale = this.rows[0] ?? {};
    this.filters = data?.filters ?? {};
    this.title = data?.title ?? 'Detalle de ventas';
  }

  close(): void {
    this._dialogRef.close();
  }

  downloadPdf(): void {
    this._api.downloadConsolidatedReport('sales-detail', 'pdf', this.filters).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Detalle_ventas.pdf';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this._toast.error('No se pudo descargar el PDF de la venta.')
    });
  }

  money(value: any): string {
    return `Q ${Number(value ?? 0).toFixed(2)}`;
  }

  get detailTotal(): number {
    return this.rows.reduce((sum, row) => sum + Number(row.lineTotal ?? 0), 0);
  }
}
