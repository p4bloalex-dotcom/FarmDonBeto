import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableActionEvent, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';
import { AuditDetailDialogComponent } from './audit-detail-dialog.component';

@Component({
  selector: 'app-consolidated-report',
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TableComponent],
  templateUrl: './consolidated-report.component.html'
})
export class ConsolidatedReportComponent implements OnInit, OnDestroy {
  branches: any[] = [];
  selectedReport = 'cash-flow';
  filters: any = { branchId: '', startDate: '', endDate: '', userId: '', module: '', action: '', recordId: '', auditId: '', page: 1, limit: 50 };
  rows: any[] = [];
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  reports = [
    { value: 'sales-period', label: 'Ventas por periodo' },
    { value: 'sales-branch', label: 'Ventas por sucursal' },
    { value: 'sales-medicine', label: 'Ventas por medicamento' },
    { value: 'top-products', label: 'Productos mas vendidos' },
    { value: 'low-movement-products', label: 'Productos menos vendidos / sin movimiento' },
    { value: 'inventory-branch', label: 'Inventario por sucursal' },
    { value: 'inventory-consolidated', label: 'Inventario consolidado' },
    { value: 'expiring-medicines', label: 'Medicamentos proximos a vencer' },
    { value: 'expired-medicines', label: 'Medicamentos vencidos' },
    { value: 'minimum-stock', label: 'Stock minimo' },
    { value: 'cash-flow', label: 'Flujo de efectivo' },
    { value: 'cash-closing', label: 'Cierre / diferencias de caja' },
    { value: 'purchases-supplier', label: 'Compras por proveedor' },
    { value: 'profitability-branch', label: 'Rentabilidad por sucursal' },
    { value: 'inventory-kardex', label: 'Inventario / Kardex' },
    { value: 'stock-transfers', label: 'Traspasos' },
    { value: 'fixed-assets', label: 'Activos fijos' },
    { value: 'fixed-assets-detail', label: 'Detalle de activos' },
    { value: 'payroll', label: 'Nomina' },
    { value: 'audit', label: 'Auditoria' }
  ];

  auditActions = [
    { value: '', label: 'Todas' },
    { value: 'INSERT', label: 'Creacion' },
    { value: 'UPDATE', label: 'Actualizacion' },
    { value: 'DELETE', label: 'Eliminacion' }
  ];

  auditModules = [
    { value: '', label: 'Todos' },
    { value: 'TB_SALE', label: 'Venta' },
    { value: 'TB_PURCHASE', label: 'Compra' },
    { value: 'TB_MEDICINE', label: 'Medicamento' },
    { value: 'TB_INVENTORY', label: 'Inventario' },
    { value: 'TB_INVENTORY_LOT', label: 'Lote de inventario' },
    { value: 'TB_CASH_SESSION', label: 'Sesion de caja' },
    { value: 'TB_CASH_MOVEMENT', label: 'Movimiento de caja' },
    { value: 'TB_PAYROLL_PAYMENT', label: 'Pago de planilla' },
    { value: 'TB_FIXED_ASSET', label: 'Activo fijo' },
    { value: 'T_USER', label: 'Usuario' },
    { value: 'T_ROLE', label: 'Rol' },
    { value: 'T_PERMISSION', label: 'Permiso' }
  ];

  columns: TableColumn[] = [];
  actions: TableAction[] = [];

  constructor(private _api: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this._api.getList('Branch').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.branches = resp.success ? resp.data ?? [] : []);
    this.loadReport();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  loadReport(): void {
    this.isLoading = true;
    this.columns = this.columnsFor(this.selectedReport);
    this.actions = this.selectedReport === 'audit' ? [{ action: 'detail', label: 'Detalle', icon: 'heroicons_outline:eye' }] : [];
    this._api.getConsolidatedReport(this.selectedReport, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el reporte.');
        this.rows = (resp.data ?? []).map((item: any) => this.decorate(item));
      },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al cargar reporte.'); }
    });
  }

  downloadReport(format: 'xlsx' | 'pdf'): void {
    this._api.downloadConsolidatedReport(this.selectedReport, format, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.fileName(format)}`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this._toast.error('No tienes permiso o no se pudo descargar el reporte.')
    });
  }

  onRowAction(event: TableActionEvent): void {
    if (event.action !== 'detail') return;
    this._api.getConsolidatedReport('audit-detail', { auditId: event.row.auditId, limit: 1 }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el detalle.');
        this._matDialog.open(AuditDetailDialogComponent, { autoFocus: false, data: { detail: resp.data?.[0] }, width: '92vw', maxWidth: '1200px' });
      },
      error: () => this._toast.error('No se pudo cargar el detalle de auditoría.')
    });
  }

  previousPage(): void {
    if (Number(this.filters.page) <= 1) return;
    this.filters.page = Number(this.filters.page) - 1;
    this.loadReport();
  }

  nextPage(): void {
    this.filters.page = Number(this.filters.page || 1) + 1;
    this.loadReport();
  }

  private columnsFor(report: string): TableColumn[] {
    const money = (field: string, header: string): TableColumn => ({ field, header, width: '110px' });
    if (report === 'sales-period' || report === 'sales-branch') return [{ field: 'branchName', header: 'Sucursal', width: '1.4fr' }, { field: 'sales', header: 'Ventas', width: '90px' }, money('grossAmountLabel', 'Bruto'), money('netAmountLabel', 'Neto'), money('costLabel', 'Costo'), money('profitLabel', 'Utilidad'), money('averageTicketLabel', 'Ticket prom.')];
    if (report === 'sales-medicine' || report === 'top-products') return [{ field: 'code', header: 'Codigo', width: '120px' }, { field: 'medicineName', header: 'Medicamento', width: '1.5fr' }, { field: 'categoryName', header: 'Categoria', width: '1fr' }, { field: 'quantitySold', header: 'Cantidad', width: '100px' }, money('averagePriceLabel', 'Precio prom.'), money('averageCostLabel', 'Costo prom.'), money('totalSoldLabel', 'Vendido'), money('profitLabel', 'Utilidad')];
    if (report === 'low-movement-products') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'code', header: 'Codigo', width: '110px' }, { field: 'medicineName', header: 'Medicamento', width: '1.5fr' }, { field: 'stockAvailable', header: 'Existencia', width: '100px' }, { field: 'lastSaleDate', header: 'Ultima venta', width: '140px' }, { field: 'nearestExpirationDate', header: 'Vence', width: '140px' }, money('inventoryValueLabel', 'Valor')];
    if (report === 'inventory-branch') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'code', header: 'Codigo', width: '110px' }, { field: 'medicineName', header: 'Medicamento', width: '1.4fr' }, { field: 'lotNumber', header: 'Lote', width: '120px' }, { field: 'expirationDate', header: 'Vence', width: '140px' }, { field: 'quantity', header: 'Cantidad', width: '100px' }, money('unitCostLabel', 'Costo'), money('inventoryValueLabel', 'Valor')];
    if (report === 'inventory-consolidated') return [{ field: 'code', header: 'Codigo', width: '120px' }, { field: 'medicineName', header: 'Medicamento', width: '1.6fr' }, { field: 'categoryName', header: 'Categoria', width: '1fr' }, { field: 'totalQuantity', header: 'Total', width: '100px' }, money('inventoryValueLabel', 'Valor')];
    if (report === 'expiring-medicines') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'medicineName', header: 'Medicamento', width: '1.5fr' }, { field: 'lotNumber', header: 'Lote', width: '120px' }, { field: 'expirationDate', header: 'Vence', width: '140px' }, { field: 'quantity', header: 'Cantidad', width: '100px' }, money('costLabel', 'Costo'), money('totalValueLabel', 'Valor')];
    if (report === 'expired-medicines') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'medicineName', header: 'Medicamento', width: '1.5fr' }, { field: 'lotNumber', header: 'Lote', width: '120px' }, { field: 'expirationDate', header: 'Vence', width: '140px' }, { field: 'quantity', header: 'Cantidad', width: '100px' }, money('costLabel', 'Costo'), money('lostValueLabel', 'Perdida')];
    if (report === 'minimum-stock') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'code', header: 'Codigo', width: '120px' }, { field: 'medicineName', header: 'Medicamento', width: '1.5fr' }, { field: 'stockAvailable', header: 'Existencia', width: '100px' }, { field: 'stockMin', header: 'Minimo', width: '100px' }, { field: 'missing', header: 'Faltante', width: '100px' }];
    if (report === 'cash-flow') return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, money('incomeLabel', 'Ingresos'), money('expenseLabel', 'Egresos'), money('netLabel', 'Neto')];
    if (report === 'cash-closing') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'cashRegisterName', header: 'Caja', width: '1fr' }, { field: 'openingDate', header: 'Apertura', width: '140px' }, { field: 'closingDate', header: 'Cierre', width: '140px' }, money('openingAmountLabel', 'Inicial'), money('expectedAmountLabel', 'Esperado'), money('closingAmountLabel', 'Contado'), money('differenceAmountLabel', 'Dif.')];
    if (report === 'purchases-supplier') return [{ field: 'supplierName', header: 'Proveedor', width: '1.5fr' }, { field: 'orders', header: 'Ordenes', width: '90px' }, { field: 'products', header: 'Productos', width: '90px' }, { field: 'units', header: 'Unidades', width: '90px' }, money('subtotalLabel', 'Subtotal'), money('taxLabel', 'Impuestos'), money('totalLabel', 'Total')];
    if (report === 'profitability-branch') return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, money('netAmountLabel', 'Ventas'), money('costLabel', 'Costo'), money('profitLabel', 'Utilidad bruta'), money('estimatedProfitLabel', 'Utilidad est.'), { field: 'marginLabel', header: 'Margen %', width: '100px' }];
    if (report === 'inventory-kardex') return [{ field: 'movementDate', header: 'Fecha', width: '1fr' }, { field: 'source', header: 'Origen', width: '120px' }, { field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'medicineName', header: 'Medicamento', width: '1.4fr' }, { field: 'quantityIn', header: 'Entrada', width: '90px' }, { field: 'quantityOut', header: 'Salida', width: '90px' }];
    if (report === 'stock-transfers') return [{ field: 'movementDate', header: 'Fecha', width: '1fr' }, { field: 'originName', header: 'Origen', width: '1fr' }, { field: 'destinationName', header: 'Destino', width: '1fr' }, { field: 'items', header: 'Items', width: '80px' }, { field: 'units', header: 'Unidades', width: '90px' }];
    if (report === 'fixed-assets') return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, { field: 'assets', header: 'Activos', width: '90px' }, money('purchaseCostLabel', 'Costo'), money('depreciationLabel', 'Deprec.'), money('bookValueLabel', 'Valor neto')];
    if (report === 'fixed-assets-detail') return [{ field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'code', header: 'Codigo', width: '120px' }, { field: 'assetName', header: 'Activo', width: '1.4fr' }, { field: 'category', header: 'Categoria', width: '1fr' }, { field: 'responsible', header: 'Responsable', width: '1fr' }, { field: 'location', header: 'Ubicacion', width: '1fr' }, money('bookValueLabel', 'Valor')];
    if (report === 'audit') return [{ field: 'auditId', header: 'Id auditoria', width: '100px' }, { field: 'createdAt', header: 'Fecha', width: '150px' }, { field: 'userId', header: 'Usuario', width: '90px' }, { field: 'objectName', header: 'Objeto', width: '1fr' }, { field: 'actionName', header: 'Accion', width: '120px' }, { field: 'recordId', header: 'Registro', width: '120px' }];
    return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, { field: 'payments', header: 'Pagos', width: '90px' }, money('baseSalaryLabel', 'Salario'), money('bonusesLabel', 'Bonos'), money('deductionsLabel', 'Deducc.'), money('totalLabel', 'Total')];
  }

  private decorate(item: any): any {
    const money = (value: any) => `Q ${Number(value ?? 0).toFixed(2)}`;
    return { ...item, incomeLabel: money(item.income), expenseLabel: money(item.expense), netLabel: money(item.net), grossAmountLabel: money(item.grossAmount), netAmountLabel: money(item.netAmount), costLabel: money(item.cost), profitLabel: money(item.profit), averageTicketLabel: money(item.averageTicket), averagePriceLabel: money(item.averagePrice), averageCostLabel: money(item.averageCost), totalSoldLabel: money(item.totalSold), unitCostLabel: money(item.unitCost), inventoryValueLabel: money(item.inventoryValue), totalValueLabel: money(item.totalValue), lostValueLabel: money(item.lostValue), openingAmountLabel: money(item.openingAmount), expectedAmountLabel: money(item.expectedAmount), closingAmountLabel: money(item.closingAmount), differenceAmountLabel: money(item.differenceAmount), subtotalLabel: money(item.subtotal), taxLabel: money(item.tax), estimatedProfitLabel: money(item.estimatedProfit), marginLabel: `${Number(item.margin ?? 0).toFixed(2)}%`, purchaseCostLabel: money(item.purchaseCost), depreciationLabel: money(item.depreciation), bookValueLabel: money(item.bookValue), baseSalaryLabel: money(item.baseSalary), bonusesLabel: money(item.bonuses), deductionsLabel: money(item.deductions), totalLabel: money(item.total) };
  }

  private fileName(format: 'xlsx' | 'pdf', label?: string): string {
    const report = label ?? this.reports.find(item => item.value === this.selectedReport)?.label ?? this.selectedReport;
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `${report.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}_${stamp}.${format}`;
  }
}
