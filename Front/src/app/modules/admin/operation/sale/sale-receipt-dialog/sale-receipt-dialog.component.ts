import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'sale-receipt-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './sale-receipt-dialog.component.html'
})
export class SaleReceiptDialogComponent {
  sale: any;
  receipt: any;
  details: any[];
  payments: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private _matDialogRef: MatDialogRef<SaleReceiptDialogComponent>
  ) {
    this.sale = data?.sale ?? {};
    this.receipt = this.sale.receipt ?? {};
    this.details = this.sale.details ?? [];
    this.payments = this.sale.payments ?? [];
  }

  close(): void {
    this._matDialogRef.close();
  }

  print(): void {
    window.print();
  }

  paymentMethodLabel(method: string): string {
    const labels: Record<string, string> = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', QR: 'Pago QR', ONLINE: 'Pago en linea', COD: 'Contra entrega' };
    return labels[String(method).toUpperCase()] ?? method;
  }
}
