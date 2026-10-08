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
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { environment } from 'environments/environment';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { InventoryEditDialogComponent } from './inventory-edit-dialog/inventory-edit-dialog.component';
import { InventoryLotSanitaryDialogComponent } from './inventory-lot-sanitary-dialog/inventory-lot-sanitary-dialog.component';
import { InventoryReserveDialogComponent } from './inventory-reserve-dialog/inventory-reserve-dialog.component';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelectModule, MatSortModule, TableComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  branchFilterControl: UntypedFormControl = new UntypedFormControl('ALL');
  statusFilterControl: UntypedFormControl = new UntypedFormControl('ALL');
  pagedData: any[] = [];
  filteredData: any[] = [];
  detailRows: any[] = [];
  branches: any[] = [];
  detailTitle = '';
  activeInsight = 'Inventario general';
  selectedRow: any = null;
  showAdvancedFilters = false;
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
    { field: 'medicineImageUrl', header: '', width: '54px', type: 'image' },
    { field: 'medicineName', header: 'Medicamento', width: 'minmax(220px,1.8fr)' },
    { field: 'branchName', header: 'Sucursal', width: 'minmax(150px,1.1fr)', hideAt: 'md' },
    { field: 'stockAvailableLabel', header: 'Disponible', width: '120px' },
    { field: 'reserveLabel', header: 'Reserva', width: '100px', hideAt: 'lg' },
    { field: 'stockMinLabel', header: 'Min.', width: '86px', hideAt: 'lg' },
    { field: 'stockMaxLabel', header: 'Max.', width: '86px', hideAt: 'lg' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];

  detailColumns: TableColumn[] = [];

  private _unsubscribeAll = new Subject<void>();

  constructor(private _generalApi: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this.loadBranches();
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged()).subscribe(() => this.applyFilters());
    this.branchFilterControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.applyFilters());
    this.statusFilterControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  get totalAvailable(): number { return this.filteredData.reduce((sum, item) => sum + Number(item.stockAvailable ?? 0), 0); }
  get totalReserved(): number { return this.filteredData.reduce((sum, item) => sum + Number(item.reserve ?? 0), 0); }
  get lowStockCount(): number { return this.filteredData.filter(item => Number(item.stockAvailable ?? 0) <= Number(item.stockMin ?? 0)).length; }
  get overStockCount(): number { return this.filteredData.filter(item => Number(item.stockMax ?? 0) > 0 && Number(item.stockAvailable ?? 0) > Number(item.stockMax ?? 0)).length; }
  get activeFiltersCount(): number { return [this.searchInputControl.value, this.branchFilterControl.value !== 'ALL', this.statusFilterControl.value !== 'ALL'].filter(Boolean).length; }
  get detailCount(): number { return this.detailRows.length; }
  get branchOptions(): any[] {
    return this.branches;
  }

  loadBranches(): void {
    this._generalApi.getList('Branch').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.branches = resp.success ? (resp.data ?? []).map((item: any) => ({ id: item.idBranch ?? item.id, name: item.name })) : [];
      },
      error: () => this._toast.error('No se pudieron cargar las sucursales.')
    });
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
        this.filteredData = (resp.data?.data ?? []).map((item: any) => this.decorateRow(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.applyFilters();
        this.activeInsight = 'Inventario general';
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar inventario.')
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    this.selectedRow = event.row;
    if (event.action === 'edit') this.openEditDialog(event.row);
    if (event.action === 'kardex') this.loadKardex(event.row);
    if (event.action === 'lots') this.loadLots(event.row);
    if (event.action === 'availability') this.loadAvailability(event.row);
    if (event.action === 'reserve') this.reserveStock(event.row);
    if (event.action === 'adjust') this.adjustStock(event.row);
  }

  selectRow(row: any): void {
    this.selectedRow = row;
    this.loadAvailability(row);
  }

  quickStatus(status: string): void {
    this.statusFilterControl.setValue(status);
    this.showAdvancedFilters = false;
  }

  loadLowStockAlerts(): void {
    this.isLoading = true;
    this._generalApi.getLowStockAlerts().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.detailTitle = 'Alertas de stock bajo';
        this.activeInsight = 'Stock bajo';
        this.detailColumns = this.columns;
        this.detailRows = (resp.data ?? []).map((item: any) => this.decorateRow(item));
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
        this.activeInsight = 'Lotes por vencer';
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
        this.activeInsight = row ? 'ATP del medicamento' : 'ATP por sucursal';
        this.detailColumns = [
          { field: 'branchName', header: 'Sucursal', width: '1fr' },
          { field: 'medicineName', header: 'Medicamento', width: '1.5fr' },
          { field: 'available', header: 'Disponible', width: '100px' },
          { field: 'reserved', header: 'Reservado', width: '100px' },
          { field: 'availableToPromise', header: 'ATP', width: '100px' },
          { field: 'inTransit', header: 'Transito', width: '100px' },
          { field: 'quarantine', header: 'Cuarentena', width: '110px' }
        ];
        this.detailRows = (resp.data ?? []).map((item: any) => this.decorateLot(item));
        if (row) this.selectedRow = { ...this.selectedRow, atpRows: this.detailRows };
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
        this.activeInsight = 'Reabastecimiento';
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
        this.activeInsight = 'Kardex';
        this.detailColumns = [
          { field: 'movementDate', header: 'Fecha', width: '1fr' },
          { field: 'movementType', header: 'Tipo', width: '120px' },
          { field: 'quantityIn', header: 'Entrada', width: '90px' },
          { field: 'quantityOut', header: 'Salida', width: '90px' },
          { field: 'balanceAfter', header: 'Saldo', width: '90px' },
          { field: 'reason', header: 'Motivo', width: '1.5fr' }
        ];
        this.detailRows = (resp.data ?? []).map((item: any) => this.decorateLot(item));
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
        this.activeInsight = 'Lotes';
        this.detailColumns = this.lotColumns();
        this.detailRows = (resp.data ?? []).map((item: any) => this.decorateLot(item));
      },
      error: () => this.finishLoad('No se pudieron cargar lotes.')
    });
  }

  adjustStock(row: any): void {
    const rawQuantity = window.prompt(`Stock contado para ${row.medicineName}`, row.stockAvailable);
    if (rawQuantity === null) return;
    const quantityAfter = Number(rawQuantity);
    if (!Number.isFinite(quantityAfter) || quantityAfter < 0) {
      this._toast.error('El stock debe ser un numero mayor o igual a cero.');
      return;
    }
    const reason = window.prompt('Motivo / autorizacion');
    if (!reason) {
      this._toast.error('El motivo es obligatorio.');
      return;
    }
    this._generalApi.addInventoryAdjustment({ branchId: row.branchId, medicineId: row.medicineId, quantityAfter, reason }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: this.pageIndex, pageSize: this.pageSize } as PageEvent) : this._toast.error(resp.error?.detail ?? 'No se pudo ajustar inventario.'),
      error: () => this._toast.error('Error inesperado al ajustar inventario.')
    });
  }

  updateLotSanitaryStatus(lot: any): void {
    const dialogRef = this._matDialog.open(InventoryLotSanitaryDialogComponent, { autoFocus: false, data: { lot }, width: '520px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(payload => {
      if (!payload) return;
      this._generalApi.updateInventoryLotSanitaryStatus(lot.id, payload).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: (resp: ApiResponse<any>) => {
          if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo actualizar el estado sanitario.');
          this._toast.success('Estado sanitario actualizado.');
          if (this.selectedRow) this.loadLots(this.selectedRow);
        },
        error: () => this._toast.error('Error inesperado al actualizar estado sanitario.')
      });
    });
  }

  reserveStock(row: any): void {
    const dialogRef = this._matDialog.open(InventoryReserveDialogComponent, { autoFocus: false, data: { row }, width: '420px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(result => {
      if (!result) return;
      const quantity = Number(result.quantity);
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
      stockMaxLabel: format(item.stockMax),
      statusLabel: this.inventoryStatus(item)
    };
  }

  clearDetail(): void {
    this.detailRows = [];
    this.detailColumns = [];
    this.detailTitle = '';
    this.activeInsight = 'Inventario general';
  }

  clearFilters(): void {
    this.searchInputControl.setValue('', { emitEvent: false });
    this.branchFilterControl.setValue('ALL', { emitEvent: false });
    this.statusFilterControl.setValue('ALL', { emitEvent: false });
    this.applyFilters();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  assetUrl(value: string): string {
    if (!value || value.startsWith('data:') || value.startsWith('http')) return value;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return apiRoot.startsWith('http') ? `${apiRoot}${value}` : value;
  }

  private applyFilters(): void {
    const text = String(this.searchInputControl.value ?? '').toLowerCase().trim();
    const branchId = this.branchFilterControl.value;
    const status = this.statusFilterControl.value;
    this.pagedData = this.filteredData.filter(item => {
      const matchesText = !text || [item.branchName, item.medicineName, item.statusLabel].some(value => String(value ?? '').toLowerCase().includes(text));
      const matchesBranch = branchId === 'ALL' || item.branchId === branchId;
      const matchesStatus = status === 'ALL' || item.statusLabel === status;
      return matchesText && matchesBranch && matchesStatus;
    });
  }

  private inventoryStatus(item: any): string {
    const available = Number(item.stockAvailable ?? 0);
    const min = Number(item.stockMin ?? 0);
    const max = Number(item.stockMax ?? 0);
    if (available <= 0) return 'Sin stock';
    if (available <= min) return 'Bajo minimo';
    if (max > 0 && available > max) return 'Sobre maximo';
    return 'Disponible';
  }

  private movementTypeLabel(value: string): string {
    const labels: Record<string, string> = {
      TRANSFER_IN: 'Entrada por traspaso',
      TRANSFER_OUT: 'Salida por traspaso',
      TRANSFER_EDIT_IN: 'Ajuste de entrada por traspaso',
      TRANSFER_EDIT_OUT: 'Ajuste de salida por traspaso',
      TRANSFER_EDIT_REVERSE_IN: 'Reversa de entrada por traspaso',
      TRANSFER_EDIT_REVERSE_OUT: 'Reversa de salida por traspaso',
      TRANSFER_DELETE_IN: 'Reversa por anulacion de traspaso',
      TRANSFER_DELETE_OUT: 'Salida por anulacion de traspaso',
      SALE: 'Venta',
      PURCHASE_RECEIPT: 'Recepcion de compra',
      ADJUSTMENT: 'Ajuste',
      RESERVATION: 'Reserva'
    };
    return labels[value] ?? value ?? '-';
  }

  private decorateLot(item: any): any {
    const status = item.sanitaryStatus ?? 'APPROVED';
    const labels: Record<string, string> = {
      APPROVED: 'Apto para venta',
      IMMOBILIZED: 'Inmovilizado',
      QUARANTINE: 'Cuarentena',
      REJECTED: 'No apto'
    };
    return { ...item, sanitaryStatusLabel: labels[status] ?? status };
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
      { field: 'quantityQuarantine', header: 'Cuarentena', width: '110px' },
      { field: 'sanitaryStatusLabel', header: 'Estado sanitario', width: '140px' },
      { field: 'sanitaryBlockReason', header: 'Motivo sanitario', width: '1.4fr' }
    ];
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
