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

@Component({
  selector: 'app-delivery-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule, TableComponent],
  templateUrl: './delivery-request.component.html',
  styleUrl: './delivery-request.component.scss'
})
export class DeliveryRequestComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'DeliveryRequest';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'accept', label: 'Aceptar', icon: 'heroicons_outline:check' },
    { action: 'send', label: 'Marcar enviada', icon: 'heroicons_outline:truck' },
    { action: 'deliver', label: 'Entregar', icon: 'heroicons_outline:archive-box' },
    { action: 'reject', label: 'Rechazar', icon: 'heroicons_outline:x-mark' },
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
  ];

  columns: TableColumn[] = [
    { field: 'requestedAtLabel', header: 'Solicitud', width: '1.3fr' },
    { field: 'customerName', header: 'Cliente', width: '1.3fr' },
    { field: 'requestingBranchName', header: 'Solicita', width: '1.4fr' },
    { field: 'fulfillmentBranchName', header: 'Entrega', width: '1.4fr' },
    { field: 'itemsCount', header: 'Items', width: '70px' },
    { field: 'statusLabel', header: 'Estado', width: '110px' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(private _generalApi: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged()).subscribe(searchText => {
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
          this.finishLoad(resp.error?.detail ?? 'Error al cargar las solicitudes.');
          return;
        }
        this.filteredData = (resp.data?.data ?? []).map(this.decorateRow);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar las solicitudes.')
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

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openDialog(event.row, 7);
    if (event.action === 'edit') this.openDialog(event.row, 2);
    if (event.action === 'delete') this.deleteRequest(event.row.id);
    if (event.action === 'accept') this.changeStatus(event.row.id, 'A');
    if (event.action === 'send') this.changeStatus(event.row.id, 'S');
    if (event.action === 'deliver') this.changeStatus(event.row.id, 'D');
    if (event.action === 'reject') this.changeStatus(event.row.id, 'R');
  }

  changeStatus(id: number, status: string): void {
    this.isLoading = true;
    this._generalApi.changeStatus(this.service, id, { status }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent) : this.finishLoad(resp.error?.detail ?? 'No se pudo cambiar el estado.'),
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
      customerName: item.customerName || 'Cliente final',
      requestedAtLabel: item.requestedAt ? new Date(item.requestedAt).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'
    };
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
