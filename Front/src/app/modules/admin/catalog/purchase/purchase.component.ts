import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { PurchaseFormDialogComponent } from './purchase-form-dialog/purchase-form-dialog.component';

@Component({
  selector: 'app-purchase',
imports: [
      CommonModule, FormsModule, ReactiveFormsModule,
      MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule,
      TableComponent
    ],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'Purchase';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
  ];

  columns: TableColumn[] = [
    { field: 'purchaseDateLabel', header: 'Fecha', width: '1.5fr' },
    { field: 'supplierName', header: 'Proveedor', width: '1.5fr' },
    { field: 'invoiceNumber', header: 'Factura', width: '1fr' },
    { field: 'itemsCount', header: 'Items', width: '70px' },
    { field: 'totalLabel', header: 'Total', width: '1fr' },
    { field: 'statusLabel', header: 'Estado', width: '110px' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(searchText => {
        const text = searchText?.toLowerCase() || '';
        this.pagedData = this.filteredData.filter(item => JSON.stringify(item).toLowerCase().includes(text));
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.isLoading = true;
    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'Error al cargar las compras.');
          this.finishLoad();
          return;
        }
        this.filteredData = (resp.data?.data ?? []).map(this.decorateRow);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar las compras.')
    });
  }

  openPurchaseDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(PurchaseFormDialogComponent, {
      autoFocus: false,
      data: { row, action },
      width: '94vw',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(updated => {
      if (!updated) return;
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      this._toast.success('Operacion exitosa');
    });
  }

  deletePurchase(id: number): void {
    this.isLoading = true;
    this._generalApi.delete(this.service, id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this._toast.success('Compra eliminada correctamente. El inventario fue actualizado.');
          this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        } else {
          this._toast.error(resp.error?.detail ?? 'No se pudo eliminar la compra.');
          this.finishLoad();
        }
      },
      error: () => this.finishLoad('Error inesperado al eliminar la compra.')
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openPurchaseDialog(event.row, 7);
    if (event.action === 'edit') this.openPurchaseDialog(event.row, 2);
    if (event.action === 'delete') this.deletePurchase(event.row.id);
  }

  private decorateRow(item: any): any {
    const numberFormat = (value: number) => (value == null ? '0.00' : Number(value).toFixed(2));
    return {
      ...item,
      purchaseDateLabel: item.purchaseDate ? new Date(item.purchaseDate).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
      totalLabel: `Q ${numberFormat(item.total ?? item.subtotal)}`,
      statusLabel: item.status === 'E' ? 'Registrada' : item.status === 'I' ? 'Anulada' : item.status ?? '-'
    };
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}