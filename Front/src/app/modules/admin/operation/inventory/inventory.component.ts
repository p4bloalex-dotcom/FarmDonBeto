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
  detailRows: any[] = [];
  detailTitle = '';
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'Inventory';
  isLoading = false;

  actions: TableAction[] = [
    { action: 'edit', label: 'Configurar', icon: 'feather:edit' },
    { action: 'kardex', label: 'Kardex', icon: 'heroicons_outline:document-chart-bar' },
    { action: 'lots', label: 'Lotes', icon: 'heroicons_outline:archive-box' },
    { action: 'availability', label: 'ATP', icon: 'heroicons_outline:check-badge' },
    { action: 'reserve', label: 'Reservar', icon: 'heroicons_outline:bookmark' },
    { action: 'adjust', label: 'Ajustar', icon: 'heroicons_outline:adjustments-horizontal' }
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

  detailColumns: TableColumn[] = [];

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
    if (event.action === 'kardex') this.loadKardex(event.row);
    if (event.action === 'lots') this.loadLots(event.row);
    if (event.action === 'availability') this.loadAvailability(event.row);
    if (event.action === 'reserve') this.reserveStock(event.row);
    if (event.action === 'adjust') this.adjustStock(event.row);
  }

  loadLowStockAlerts(): void {
    this.isLoading = true;
    this._generalApi.getLowStockAlerts().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = 'Alertas de stock bajo';
        this.detailColumns = this.columns;
        this.detailRows = (resp.data ?? []).map(this.decorateRow);
      },
      error: () => this.finishLoad('No se pudieron cargar alertas.')
    });
  }

  loadExpiringLots(): void {
    this.isLoading = true;
    this._generalApi.getInventoryLots({ expiringDays: 60 }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = 'Lotes por vencer en 60 dias';
        this.detailColumns = this.lotColumns();
        this.detailRows = resp.data ?? [];
      },
      error: () => this.finishLoad('No se pudieron cargar lotes por vencer.')
    });
  }

  loadAvailability(row?: any): void {
    this.isLoading = true;
    const filters = row ? { branchId: row.branchId, medicineId: row.medicineId } : {};
    this._generalApi.getInventoryAvailability(filters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = row ? `Disponible para prometer - ${row.medicineName}` : 'Disponible para prometer por sucursal';
        this.detailColumns = [
          { field: 'branchName', header: 'Sucursal', width: '1fr' },
          { field: 'medicineName', header: 'Medicamento', width: '1.5fr' },
          { field: 'available', header: 'Disponible', width: '100px' },
          { field: 'reserved', header: 'Reservado', width: '100px' },
          { field: 'availableToPromise', header: 'ATP', width: '100px' },
          { field: 'inTransit', header: 'Transito', width: '100px' },
          { field: 'quarantine', header: 'Cuarentena', width: '110px' }
        ];
        this.detailRows = resp.data ?? [];
      },
      error: () => this.finishLoad('No se pudo cargar disponibilidad.')
    });
  }

  loadReplenishmentSuggestions(): void {
    this.isLoading = true;
    this._generalApi.getReplenishmentSuggestions().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = 'Sugerencias de reabastecimiento';
        this.detailColumns = [
          { field: 'branchName', header: 'Sucursal', width: '1fr' },
          { field: 'medicineName', header: 'Medicamento', width: '1.4fr' },
          { field: 'currentAvailableToPromise', header: 'ATP actual', width: '100px' },
          { field: 'reorderPoint', header: 'Reorden', width: '100px' },
          { field: 'minimumStock', header: 'Minimo', width: '100px' },
          { field: 'neededQuantity', header: 'Necesidad', width: '100px' },
          { field: 'suggestionType', header: 'Accion', width: '120px' },
          { field: 'sourceSummary', header: 'Origen sugerido', width: '1.4fr' }
        ];
        this.detailRows = (resp.data ?? []).map((item: any) => ({
          ...item,
          sourceSummary: item.transferSources?.length ? item.transferSources.map((source: any) => `${source.branchName}: ${Number(source.surplus ?? 0).toFixed(2)}`).join(', ') : 'Compra a proveedor'
        }));
      },
      error: () => this.finishLoad('No se pudieron cargar sugerencias.')
    });
  }

  loadKardex(row: any): void {
    this.isLoading = true;
    this._generalApi.getInventoryKardex({ branchId: row.branchId, medicineId: row.medicineId }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = `Kardex - ${row.medicineName}`;
        this.detailColumns = [
          { field: 'movementDate', header: 'Fecha', width: '1fr' },
          { field: 'movementType', header: 'Tipo', width: '120px' },
          { field: 'quantityIn', header: 'Entrada', width: '90px' },
          { field: 'quantityOut', header: 'Salida', width: '90px' },
          { field: 'balanceAfter', header: 'Saldo', width: '90px' },
          { field: 'reason', header: 'Motivo', width: '1.5fr' }
        ];
        this.detailRows = resp.data ?? [];
      },
      error: () => this.finishLoad('No se pudo cargar kardex.')
    });
  }

  loadLots(row: any): void {
    this.isLoading = true;
    this._generalApi.getInventoryLots({ branchId: row.branchId, medicineId: row.medicineId }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = `Lotes - ${row.medicineName}`;
        this.detailColumns = this.lotColumns();
        this.detailRows = resp.data ?? [];
      },
      error: () => this.finishLoad('No se pudieron cargar lotes.')
    });
  }

  adjustStock(row: any): void {
    const rawQuantity = window.prompt(`Nuevo stock disponible para ${row.medicineName}`, row.stockAvailable);
    if (rawQuantity === null) return;
    const reason = window.prompt('Motivo del ajuste');
    if (!reason) {
      this._toast.error('El motivo es obligatorio.');
      return;
    }
    this._generalApi.addInventoryAdjustment({ branchId: row.branchId, medicineId: row.medicineId, quantityAfter: Number(rawQuantity), reason }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: this.pageIndex, pageSize: this.pageSize } as PageEvent) : this._toast.error(resp.error?.detail ?? 'No se pudo ajustar inventario.'),
      error: () => this._toast.error('Error inesperado al ajustar inventario.')
    });
  }

  reserveStock(row: any): void {
    const rawQuantity = window.prompt(`Cantidad a reservar para ${row.medicineName}`);
    if (rawQuantity === null) return;
    const quantity = Number(rawQuantity);
    if (!quantity || quantity <= 0) {
      this._toast.error('La cantidad debe ser mayor a cero.');
      return;
    }
    this._generalApi.createInventoryReservation({ branchId: row.branchId, medicineId: row.medicineId, quantity }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo reservar inventario.');
          return;
        }
        this._toast.success('Reserva registrada correctamente.');
        this.loadAvailability(row);
      },
      error: () => this._toast.error('Error inesperado al reservar inventario.')
    });
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

  private lotColumns(): TableColumn[] {
    return [
      { field: 'branchName', header: 'Sucursal', width: '1fr' },
      { field: 'medicineName', header: 'Medicamento', width: '1.4fr' },
      { field: 'lotNumber', header: 'Lote', width: '120px' },
      { field: 'expirationDate', header: 'Vence', width: '1fr' },
      { field: 'quantity', header: 'Fisico', width: '90px' },
      { field: 'quantityAvailable', header: 'Disponible', width: '100px' },
      { field: 'quantityReserved', header: 'Reservado', width: '100px' },
      { field: 'availableToPromise', header: 'ATP', width: '90px' },
      { field: 'quantityQuarantine', header: 'Cuarentena', width: '110px' }
    ];
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
