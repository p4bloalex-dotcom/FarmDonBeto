import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-payroll',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TableComponent],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit, OnDestroy {
  positionForm: UntypedFormGroup;
  salaryForm: UntypedFormGroup;
  generateForm: UntypedFormGroup;
  adjustmentForm: UntypedFormGroup;
  positions: any[] = [];
  salaries: any[] = [];
  payments: any[] = [];
  adjustments: any[] = [];
  employees: any[] = [];
  branches: any[] = [];
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  salaryColumns: TableColumn[] = [
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'positionName', header: 'Puesto', width: '1fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'baseSalaryLabel', header: 'Salario', width: '110px' },
    { field: 'status', header: 'Estado', width: '80px' }
  ];
  paymentColumns: TableColumn[] = [
    { field: 'paymentDate', header: 'Pago', width: '1fr' },
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'positionName', header: 'Puesto', width: '1fr' },
    { field: 'totalLabel', header: 'Total', width: '110px' },
    { field: 'status', header: 'Estado', width: '80px' }
  ];
  paymentActions: TableAction[] = [{ action: 'void', label: 'Anular', icon: 'heroicons_outline:x-circle' }];
  adjustmentColumns: TableColumn[] = [
    { field: 'adjustmentDate', header: 'Fecha', width: '1fr' },
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'typeLabel', header: 'Tipo', width: '100px' },
    { field: 'amountLabel', header: 'Monto', width: '110px' },
    { field: 'status', header: 'Estado', width: '80px' },
    { field: 'reason', header: 'Motivo', width: '1.5fr' }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService) { }

  ngOnInit(): void {
    this.positionForm = this._fb.group({ name: ['', Validators.required], description: [''], status: ['E'] });
    this.salaryForm = this._fb.group({ employeeId: ['', Validators.required], positionId: ['', Validators.required], branchId: ['', Validators.required], baseSalary: [0, [Validators.required, Validators.min(0)]], effectiveFrom: ['', Validators.required], notes: [''] });
    this.generateForm = this._fb.group({ branchId: [''], periodStart: ['', Validators.required], periodEnd: ['', Validators.required], paymentDate: [''], defaultBonus: [0], defaultDeduction: [0], notes: [''] });
    this.adjustmentForm = this._fb.group({ employeeId: ['', Validators.required], branchId: ['', Validators.required], type: ['B', Validators.required], amount: [0, [Validators.required, Validators.min(0.01)]], adjustmentDate: [''], reason: ['', Validators.required] });
    this.loadCatalogs();
    this.refreshAll();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  loadCatalogs(): void {
    this._api.comboList(['Personal', 'Branch']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([employees, branches]) => { this.employees = employees; this.branches = branches; },
      error: () => this._toast.error('No se pudieron cargar catalogos.')
    });
  }

  refreshAll(): void {
    this.isLoading = true;
    this._api.getPayroll('positions').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.positions = resp.success ? resp.data ?? [] : []);
    this._api.getPayroll('salaries').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.salaries = resp.success ? (resp.data ?? []).map(this.decorateSalary) : []);
    this._api.getPayroll('adjustments').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.adjustments = resp.success ? (resp.data ?? []).map(this.decorateAdjustment) : []);
    this._api.getPayroll('payments').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { this.payments = resp.success ? (resp.data ?? []).map(this.decoratePayment) : []; this.isLoading = false; },
      error: () => { this.isLoading = false; this._toast.error('No se pudo cargar nomina.'); }
    });
  }

  savePosition(): void {
    if (this.positionForm.invalid) return;
    this._api.postPayroll('positions', this.positionForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => { resp.success ? (this.positionForm.reset({ status: 'E' }), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo guardar puesto.'); },
      error: () => this._toast.error('Error inesperado al guardar puesto.')
    });
  }

  saveSalary(): void {
    if (this.salaryForm.invalid) return;
    this._api.postPayroll('salaries', this.salaryForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => { resp.success ? (this.salaryForm.reset(), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo asignar salario.'); },
      error: () => this._toast.error('Error inesperado al asignar salario.')
    });
  }

  generatePayroll(): void {
    if (this.generateForm.invalid) return;
    this.isLoading = true;
    this._api.postPayroll('generate', this.generateForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => { this.isLoading = false; resp.success ? (this._toast.success('Nomina generada.'), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo generar nomina.'); },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al generar nomina.'); }
    });
  }

  saveAdjustment(): void {
    if (this.adjustmentForm.invalid) return;
    this._api.postPayroll('adjustments', this.adjustmentForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => { resp.success ? (this.adjustmentForm.reset({ type: 'B', amount: 0 }), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo guardar ajuste.'); },
      error: () => this._toast.error('Error inesperado al guardar ajuste.')
    });
  }

  handlePaymentAction(event: { action: string; row: any }): void {
    if (event.action !== 'void') return;
    const reason = window.prompt('Motivo de anulacion');
    if (!reason) return;
    this._api.voidPayrollPayment(event.row.id, reason).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => resp.success ? this.refreshAll() : this._toast.error(resp.error?.detail ?? 'No se pudo anular pago.'),
      error: () => this._toast.error('Error inesperado al anular pago.')
    });
  }

  private decorateSalary(item: any): any { return { ...item, baseSalaryLabel: `Q ${Number(item.baseSalary ?? 0).toFixed(2)}` }; }
  private decoratePayment(item: any): any { return { ...item, totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}` }; }
  private decorateAdjustment(item: any): any { return { ...item, typeLabel: item.type === 'B' ? 'Bono' : 'Deduccion', amountLabel: `Q ${Number(item.amount ?? 0).toFixed(2)}` }; }
}
