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
import { InventoryEditDialogComponent } from './inventory-edit-dialog/inventory-edit-dialog.component';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule, TableComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'Inventory';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'edit', label: 'Configurar', icon: 'feather:edit' }
  ];

  columns: TableColumn[] = [
    { field: 'branchName', header: 'Sucursal', width: '1.4fr' },
    { field: 'medicineName', header: 'Medicamento', width: '1.8fr' },
    { field: 'stockAvailableLabel', header: 'Disponible', width: '120px' },
    { field: 'reserveLabel', header: 'Reserva', width: '100px' },
    { field: 'stockMinLabel', header: 'Minimo', width: '100px' },
    { field: 'stockMaxLabel', header: 'Maximo', width: '100px' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
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
          this.finishLoad(resp.error?.detail ?? 'Error al cargar inventario.');
          return;
        }
        this.filteredData = (resp.data?.data ?? []).map(this.decorateRow);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar inventario.')
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.openEditDialog(event.row);
  }

  openEditDialog(row: any): void {
    const dialogRef = this._matDialog.open(InventoryEditDialogComponent, { autoFocus: false, data: { row }, width: '520px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(updated => {
      if (!updated) return;
      this.onPageChange({ pageIndex: this.pageIndex, pageSize: this.pageSize } as PageEvent);
      this._toast.success('Inventario actualizado correctamente.');
    });
  }

  private decorateRow(item: any): any {
    const format = (value: number) => Number(value ?? 0).toFixed(2);
    return {
      ...item,
      stockAvailableLabel: format(item.stockAvailable),
      reserveLabel: format(item.reserve),
      stockMinLabel: format(item.stockMin),
      stockMaxLabel: format(item.stockMax)
    };
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
