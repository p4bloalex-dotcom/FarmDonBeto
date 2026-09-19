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
import { FixedAssetFormDialogComponent } from './fixed-asset-form-dialog/fixed-asset-form-dialog.component';

@Component({
  selector: 'app-fixed-asset',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule, TableComponent],
  templateUrl: './fixed-asset.component.html',
  styleUrl: './fixed-asset.component.scss'
})
export class FixedAssetComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'FixedAsset';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'transfer', label: 'Trasladar', icon: 'heroicons_outline:arrow-right-circle' },
    { action: 'disable', label: 'Dar de baja', icon: 'heroicons_outline:archive-box-x-mark' }
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'Codigo', width: '1fr' },
    { field: 'name', header: 'Activo', width: '1.5fr' },
    { field: 'branchName', header: 'Sucursal', width: '1.4fr' },
    { field: 'category', header: 'Categoria', width: '1fr' },
    { field: 'purchaseCostLabel', header: 'Costo', width: '110px' },
    { field: 'bookValueLabel', header: 'Valor libros', width: '120px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
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
        if (!resp.success) return this.finishLoad(resp.error?.detail ?? 'Error al cargar activos fijos.');
        this.filteredData = (resp.data?.data ?? []).map(this.decorateRow);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar activos fijos.')
    });
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(FixedAssetFormDialogComponent, { autoFocus: false, data: { row, action }, width: '94vw', maxWidth: '860px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(updated => {
      if (!updated) return;
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      this._toast.success('Operacion exitosa');
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openDialog(event.row, 7);
    if (event.action === 'edit') this.openDialog(event.row, 2);
    if (event.action === 'transfer') this.openDialog(event.row, 8);
    if (event.action === 'disable') this.retireAsset(event.row.id);
  }

  retireAsset(id: number): void {
    const reason = window.prompt('Motivo de baja del activo fijo');
    if (!reason) return;
    this.isLoading = true;
    this._generalApi.postAction(this.service, id, 'retire', { reason }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent) : this.finishLoad(resp.error?.detail ?? 'No se pudo dar de baja el activo.'),
      error: () => this.finishLoad('Error inesperado al dar de baja el activo.')
    });
  }

  private decorateRow(item: any): any {
    const money = (value: number) => `Q ${Number(value ?? 0).toFixed(2)}`;
    return {
      ...item,
      purchaseCostLabel: money(item.purchaseCost),
      bookValueLabel: money(item.bookValue),
      statusLabel: item.status === 'E' ? 'Activo' : item.status === 'D' ? 'Baja' : 'Inactivo'
    };
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
