import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-consolidated-report',
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TableComponent],
  templateUrl: './consolidated-report.component.html'
})
export class ConsolidatedReportComponent implements OnInit, OnDestroy {
  branches: any[] = [];
  selectedReport = 'cash-flow';
  filters: any = { branchId: '', startDate: '', endDate: '' };
  rows: any[] = [];
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  reports = [
    { value: 'cash-flow', label: 'Flujo de efectivo' },
    { value: 'inventory-kardex', label: 'Inventario / Kardex' },
    { value: 'stock-transfers', label: 'Traspasos' },
    { value: 'fixed-assets', label: 'Activos fijos' },
    { value: 'payroll', label: 'Nomina' }
  ];

  columns: TableColumn[] = [];

  constructor(private _api: GeneralApiService, private _toast: HotToastService) { }

  ngOnInit(): void {
    this._api.getList('Branch').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.branches = resp.success ? resp.data ?? [] : []);
    this.loadReport();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  loadReport(): void {
    this.isLoading = true;
    this.columns = this.columnsFor(this.selectedReport);
    this._api.getConsolidatedReport(this.selectedReport, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el reporte.');
        this.rows = (resp.data ?? []).map((item: any) => this.decorate(item));
      },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al cargar reporte.'); }
    });
  }

  private columnsFor(report: string): TableColumn[] {
    const money = (field: string, header: string): TableColumn => ({ field, header, width: '110px' });
    if (report === 'cash-flow') return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, money('incomeLabel', 'Ingresos'), money('expenseLabel', 'Egresos'), money('netLabel', 'Neto')];
    if (report === 'inventory-kardex') return [{ field: 'movementDate', header: 'Fecha', width: '1fr' }, { field: 'source', header: 'Origen', width: '120px' }, { field: 'branchName', header: 'Sucursal', width: '1fr' }, { field: 'medicineName', header: 'Medicamento', width: '1.4fr' }, { field: 'quantityIn', header: 'Entrada', width: '90px' }, { field: 'quantityOut', header: 'Salida', width: '90px' }];
    if (report === 'stock-transfers') return [{ field: 'movementDate', header: 'Fecha', width: '1fr' }, { field: 'originName', header: 'Origen', width: '1fr' }, { field: 'destinationName', header: 'Destino', width: '1fr' }, { field: 'items', header: 'Items', width: '80px' }, { field: 'units', header: 'Unidades', width: '90px' }];
    if (report === 'fixed-assets') return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, { field: 'assets', header: 'Activos', width: '90px' }, money('purchaseCostLabel', 'Costo'), money('depreciationLabel', 'Deprec.'), money('bookValueLabel', 'Valor neto')];
    return [{ field: 'branchName', header: 'Sucursal', width: '1.5fr' }, { field: 'payments', header: 'Pagos', width: '90px' }, money('baseSalaryLabel', 'Salario'), money('bonusesLabel', 'Bonos'), money('deductionsLabel', 'Deducc.'), money('totalLabel', 'Total')];
  }

  private decorate(item: any): any {
    const money = (value: any) => `Q ${Number(value ?? 0).toFixed(2)}`;
    return { ...item, incomeLabel: money(item.income), expenseLabel: money(item.expense), netLabel: money(item.net), purchaseCostLabel: money(item.purchaseCost), depreciationLabel: money(item.depreciation), bookValueLabel: money(item.bookValue), baseSalaryLabel: money(item.baseSalary), bonusesLabel: money(item.bonuses), deductionsLabel: money(item.deductions), totalLabel: money(item.total) };
  }
}
