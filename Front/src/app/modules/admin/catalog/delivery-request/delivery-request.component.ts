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
import { DeliveryRequestFormDialogComponent } from './delivery-request-form-dialog/delivery-request-form-dialog.component';
import { StockTransferFormDialogComponent } from '../stock-transfer/stock-transfer-form-dialog/stock-transfer-form-dialog.component';

@Component({
  selector: 'app-delivery-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule, TableComponent],
  templateUrl: './delivery-request.component.html',
  styleUrl: './delivery-request.component.scss'
})
export class DeliveryRequestComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  activeView: 'requests' | 'movements' = 'requests';
  pagedData: any[] = [];
  filteredData: any[] = [];
  transferData: any[] = [];
  filteredTransferData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'DeliveryRequest';
  transferService = 'StockTransfer';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar solicitud', icon: 'feather:edit', visible: row => row.status === 'P' },
    { action: 'accept', label: 'Aceptar traslado', icon: 'heroicons_outline:check', visible: row => row.status === 'P' },
    { action: 'send', label: 'Marcar enviado', icon: 'heroicons_outline:truck', visible: row => row.status === 'A' },
    { action: 'deliver', label: 'Confirmar entrega', icon: 'heroicons_outline:archive-box', visible: row => row.status === 'S' },
    { action: 'reject', label: 'Rechazar solicitud', icon: 'heroicons_outline:x-mark', visible: row => row.status === 'P' },
    { action: 'delete', label: 'Eliminar solicitud', icon: 'delete_forever', visible: row => ['P', 'R', 'C'].includes(row.status) }
  ];

  transferActions: TableAction[] = [
    { action: 'view-transfer', label: 'Ver movimiento', icon: 'feather:eye' }
  ];

  columns: TableColumn[] = [
    { field: 'requestedAtLabel', header: 'Fecha', width: '1.3fr' },
    { field: 'requestingBranchName', header: 'Sucursal que recibe', width: '1.4fr' },
    { field: 'fulfillmentBranchName', header: 'Sucursal que entrega', width: '1.4fr' },
    { field: 'itemsCount', header: 'Items', width: '70px' },
    { field: 'nextStepLabel', header: 'Siguiente accion', width: '1.2fr' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];

  transferColumns: TableColumn[] = [
    { field: 'movementDateLabel', header: 'Fecha aplicada', width: '1.4fr' },
    { field: 'branchOriginName', header: 'Salio de', width: '1.4fr' },
    { field: 'branchDestinationName', header: 'Entro a', width: '1.4fr' },
    { field: 'itemsCount', header: 'Items', width: '70px' },
    { field: 'description', header: 'Origen del movimiento', width: '1.6fr' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(private _generalApi: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this.loadCurrentView({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged()).subscribe(searchText => {
      const text = searchText?.toLowerCase() || '';
      if (this.activeView === 'requests') this.pagedData = this.filteredData.filter(item => JSON.stringify(item).toLowerCase().includes(text));
      if (this.activeView === 'movements') this.transferData = this.filteredTransferData.filter(item => JSON.stringify(item).toLowerCase().includes(text));
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  selectView(view: 'requests' | 'movements'): void {
    this.activeView = view;
    this.searchInputControl.setValue('', { emitEvent: false });
    this.loadCurrentView({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
  }

  loadCurrentView(event: PageEvent): void {
    if (this.activeView === 'requests') this.onPageChange(event);
    if (this.activeView === 'movements') this.onTransferPageChange(event);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.isLoading = true;
    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this.finishLoad(resp.error?.detail ?? 'Error al cargar las solicitudes.');
          return;
        }
        this.filteredData = (resp.data?.data ?? []).map(item => this.decorateRow(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar las solicitudes.')
    });
  }

  onTransferPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.isLoading = true;
    this._generalApi.getPaged(this.transferService, this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this.finishLoad(resp.error?.detail ?? 'Error al cargar los movimientos.');
          return;
        }
        this.filteredTransferData = (resp.data?.data ?? []).map(item => this.decorateTransferRow(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.transferData = this.filteredTransferData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar los movimientos.')
    });
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(DeliveryRequestFormDialogComponent, { autoFocus: false, data: { row, action }, width: '94vw', maxWidth: '900px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(updated => {
      if (!updated) return;
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      this._toast.success('Operacion exitosa');
    });
  }

  openTransferDialog(row: any): void {
    this._matDialog.open(StockTransferFormDialogComponent, { autoFocus: false, data: { row, action: 7 }, width: '94vw', maxWidth: '900px', disableClose: true });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openDialog(event.row, 7);
    if (event.action === 'edit') this.openDialog(event.row, 2);
    if (event.action === 'delete') this.deleteRequest(event.row.id);
    if (event.action === 'accept') this.changeStatus(event.row.id, 'A');
    if (event.action === 'send') this.changeStatus(event.row.id, 'S');
    if (event.action === 'deliver') this.changeStatus(event.row.id, 'D');
    if (event.action === 'reject') this.changeStatus(event.row.id, 'R');
    if (event.action === 'view-transfer') this.openTransferDialog(event.row);
  }

  changeStatus(id: number, status: string): void {
    this.isLoading = true;
    this._generalApi.changeStatus(this.service, id, { status }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this.finishLoad(resp.error?.detail ?? 'No se pudo cambiar el estado.');
          return;
        }
        this._toast.success(status === 'D' ? 'Entrega confirmada. Movimiento de stock aplicado.' : 'Solicitud actualizada.');
        this.loadCurrentView({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      },
      error: () => this.finishLoad('Error inesperado al cambiar el estado.')
    });
  }

  deleteRequest(id: number): void {
    this.isLoading = true;
    this._generalApi.delete(this.service, id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent) : this.finishLoad(resp.error?.detail ?? 'No se pudo eliminar la solicitud.'),
      error: () => this.finishLoad('Error inesperado al eliminar la solicitud.')
    });
  }

  private decorateRow(item: any): any {
    return {
      ...item,
      requestedAtLabel: item.requestedAt ? new Date(item.requestedAt).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
      nextStepLabel: this.nextStepLabel(item.status),
      statusLabel: this.requestStatusLabel(item.status)
    };
  }

  private decorateTransferRow(item: any): any {
    return {
      ...item,
      movementDateLabel: item.movementDate ? new Date(item.movementDate).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
      statusLabel: item.status === 'E' ? 'Stock aplicado' : item.status === 'I' ? 'Anulado' : item.status ?? '-'
    };
  }

  private requestStatusLabel(status: string): string {
    const labels: Record<string, string> = { P: 'Pendiente', A: 'Aceptada', R: 'Rechazada', S: 'En camino', D: 'Entregada', C: 'Cancelada' };
    return labels[status] ?? status ?? '-';
  }

  private nextStepLabel(status: string): string {
    const labels: Record<string, string> = { P: 'Aceptar o rechazar', A: 'Enviar desde origen', S: 'Confirmar entrega', D: 'Stock ya aplicado', R: 'Sin accion', C: 'Sin accion' };
    return labels[status] ?? '-';
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
