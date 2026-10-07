import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';
import { SaleReceiptDialogComponent } from '../sale-receipt-dialog/sale-receipt-dialog.component';

@Component({
  selector: 'sale-history-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, TableComponent],
  templateUrl: './sale-history-dialog.component.html'
})
export class SaleHistoryDialogComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  isLoading = false;
  private loadingSaleId: number | null = null;
  private _unsubscribeAll = new Subject<void>();

  columns: TableColumn[] = [
    { field: 'id', header: 'Venta', width: '80px' },
    { field: 'saleDateLabel', header: 'Fecha', width: '140px' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'paymentLabel', header: 'Pago', width: '120px' },
    { field: 'channelLabel', header: 'Canal', width: '120px' },
    { field: 'totalLabel', header: 'Total', width: '110px' }
  ];
  actions: TableAction[] = [{ action: 'detail', label: 'Detalle', icon: 'heroicons_outline:eye' }];

  constructor(
    private _dialogRef: MatDialogRef<SaleHistoryDialogComponent>,
    private _api: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void { this.loadHistory(); }
  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  close(): void { this._dialogRef.close(); }

  loadHistory(event?: PageEvent): void {
    if (event) { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }
    this.isLoading = true;
    this._api.getPaged('Sale', this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.rows = (resp.data?.data ?? []).map((item: any) => this.decorateSale(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
      },
      error: () => { this.isLoading = false; this._toast.error('No se pudo cargar el historial de ventas.'); }
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action !== 'detail') return;
    const saleId = Number(event.row.id);
    if (!saleId || this.loadingSaleId === saleId) return;
    this.loadingSaleId = saleId;
    this._api.GetById('Sale', saleId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.loadingSaleId = null;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el detalle de venta.');
        this._matDialog.open(SaleReceiptDialogComponent, { autoFocus: false, width: '520px', maxWidth: '95vw', data: { sale: resp.data } });
      },
      error: () => { this.loadingSaleId = null; this._toast.error('Error inesperado al cargar detalle de venta.'); }
    });
  }

  private decorateSale(item: any): any {
    const payments: Record<string, string> = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', MIXED: 'Mixto', COD: 'Contra entrega' };
    const channels: Record<string, string> = { IN_STORE: 'Mostrador', CALL_CENTER: 'Call Center' };
    return {
      ...item,
      saleDateLabel: String(item.saleDate ?? '').slice(0, 16).replace('T', ' '),
      paymentLabel: payments[item.paymentMethod] ?? item.paymentMethod,
      channelLabel: channels[item.saleChannel] ?? item.saleChannel ?? 'Mostrador',
      totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}`
    };
  }
}
