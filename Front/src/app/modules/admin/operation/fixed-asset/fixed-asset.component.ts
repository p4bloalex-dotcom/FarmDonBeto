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
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { FixedAssetFormDialogComponent } from './fixed-asset-form-dialog/fixed-asset-form-dialog.component';
import { FixedAssetRetireDialogComponent } from './fixed-asset-retire-dialog/fixed-asset-retire-dialog.component';

@Component({
  selector: 'app-fixed-asset',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelectModule, MatSortModule, TableComponent],
  templateUrl: './fixed-asset.component.html',
  styleUrl: './fixed-asset.component.scss'
})
export class FixedAssetComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  branchFilterControl: UntypedFormControl = new UntypedFormControl('ALL');
  statusFilterControl: UntypedFormControl = new UntypedFormControl('ALL');
  categoryFilterControl: UntypedFormControl = new UntypedFormControl('ALL');
  pagedData: any[] = [];
  filteredData: any[] = [];
  selectedAsset: any = null;
  historyRows: any[] = [];
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

  historyColumns: TableColumn[] = [
    { field: 'createdAt', header: 'Fecha', width: '1fr' },
    { field: 'actionLabel', header: 'Accion', width: '110px' },
    { field: 'branchFromName', header: 'Origen', width: '1fr' },
    { field: 'branchToName', header: 'Destino', width: '1fr' },
    { field: 'responsibleTo', header: 'Responsable', width: '1fr' },
    { field: 'reason', header: 'Motivo', width: '1.5fr' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(private _generalApi: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged()).subscribe(() => this.applyFilters());
    this.branchFilterControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.applyFilters());
    this.statusFilterControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.applyFilters());
    this.categoryFilterControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.applyFilters());
  }

  get totalCost(): number { return this.filteredData.reduce((sum, item) => sum + Number(item.purchaseCost ?? 0), 0); }
  get totalBookValue(): number { return this.filteredData.reduce((sum, item) => sum + Number(item.bookValue ?? 0), 0); }
  get activeCount(): number { return this.filteredData.filter(item => item.status === 'E').length; }
  get maintenanceCount(): number { return this.filteredData.filter(item => item.status === 'M').length; }
  get retiredCount(): number { return this.filteredData.filter(item => item.status === 'D').length; }
  get branchOptions(): any[] {
    const branches = new Map<number, string>();
    this.filteredData.forEach(item => { if (item.branchId) branches.set(item.branchId, item.branchName); });
    return Array.from(branches.entries()).map(([id, name]) => ({ id, name }));
  }
  get categoryOptions(): string[] { return Array.from(new Set(this.filteredData.map(item => item.category).filter(Boolean))).sort(); }

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
        this.filteredData = (resp.data?.data ?? []).map((item: any) => this.decorateRow(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.applyFilters();
        if (!this.selectedAsset && this.filteredData.length) this.selectAsset(this.filteredData[0], false);
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
    this.selectAsset(event.row);
    if (event.action === 'view') return;
    if (event.action === 'edit') this.openDialog(event.row, 2);
    if (event.action === 'transfer') this.openDialog(event.row, 8);
    if (event.action === 'disable') this.retireAsset(event.row);
  }

  selectAsset(row: any, loadHistory = true): void {
    this.selectedAsset = row;
    if (!loadHistory) return;
    this.loadHistory(row.id);
  }

  loadHistory(id: number): void {
    this._generalApi.getAction(this.service, id, 'history').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => this.historyRows = (resp.success ? resp.data ?? [] : []).map((item: any) => ({
        ...item,
        actionLabel: item.action === 'TRANSFERRED' || item.action === 'ASSIGNMENT' ? 'Asignacion' : item.action === 'RETIRED' ? 'Baja' : item.action
      })),
      error: () => this._toast.error('No se pudo cargar historial del activo.')
    });
  }

  retireAsset(row: any): void {
    const dialogRef = this._matDialog.open(FixedAssetRetireDialogComponent, { autoFocus: false, data: { row }, width: '460px', disableClose: true });
    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(result => {
      if (!result) return;
      this.isLoading = true;
      this._generalApi.postAction(this.service, row.id, 'retire', { reason: result.reason }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: (resp: ApiResponse<any>) => resp.success ? this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent) : this.finishLoad(resp.error?.detail ?? 'No se pudo dar de baja el activo.'),
        error: () => this.finishLoad('Error inesperado al dar de baja el activo.')
      });
    });
  }

  clearFilters(): void {
    this.searchInputControl.setValue('', { emitEvent: false });
    this.branchFilterControl.setValue('ALL', { emitEvent: false });
    this.statusFilterControl.setValue('ALL', { emitEvent: false });
    this.categoryFilterControl.setValue('ALL', { emitEvent: false });
    this.applyFilters();
  }

  private decorateRow(item: any): any {
    const money = (value: number) => `Q ${Number(value ?? 0).toFixed(2)}`;
    return {
      ...item,
      purchaseCostLabel: money(item.purchaseCost),
      bookValueLabel: money(item.bookValue),
      statusLabel: item.status === 'E' ? 'Activo' : item.status === 'M' ? 'Mantenimiento' : 'Baja',
      conditionLabel: item.condition === 'REGULAR' ? 'Regular' : item.condition === 'MALO' ? 'Malo' : 'Bueno'
    };
  }

  private applyFilters(): void {
    const text = String(this.searchInputControl.value ?? '').toLowerCase().trim();
    const branchId = this.branchFilterControl.value;
    const status = this.statusFilterControl.value;
    const category = this.categoryFilterControl.value;
    this.pagedData = this.filteredData.filter(item => {
      const matchesText = !text || [item.code, item.name, item.branchName, item.category, item.brand, item.model, item.serialNumber, item.location, item.responsible].some(value => String(value ?? '').toLowerCase().includes(text));
      const matchesBranch = branchId === 'ALL' || item.branchId === branchId;
      const matchesStatus = status === 'ALL' || item.status === status;
      const matchesCategory = category === 'ALL' || item.category === category;
      return matchesText && matchesBranch && matchesStatus && matchesCategory;
    });
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
