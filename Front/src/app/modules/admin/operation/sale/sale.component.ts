import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent } from '@angular/material/paginator';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sale',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, TableComponent],
  templateUrl: './sale.component.html'
})
export class SaleComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  medicines: any[] = [];
  medicineSearchControl: UntypedFormControl = new UntypedFormControl('');
  medicineSearchText = '';
  branches: any[] = [];
  employees: any[] = [];
  sessions: any[] = [];
  rows: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  columns: TableColumn[] = [
    { field: 'id', header: 'Venta', width: '80px' },
    { field: 'saleDate', header: 'Fecha', width: '1fr' },
    { field: 'branchName', header: 'Sucursal', width: '1.2fr' },
    { field: 'employeeName', header: 'Empleado', width: '1.2fr' },
    { field: 'paymentMethod', header: 'Pago', width: '100px' },
    { field: 'totalLabel', header: 'Total', width: '100px' }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      branchId: ['', Validators.required],
      employeeId: ['', Validators.required],
      cashSessionId: ['', Validators.required],
      paymentMethod: ['CASH', Validators.required],
      payments: this._fb.array([]),
      taxRate: [0, [Validators.required, Validators.min(0)]],
      details: this._fb.array([])
    });
    this.addItem();
    this.addPayment();
    this.form.get('branchId')!.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.details.controls.forEach(item => item.get('medicineId')?.reset(''));
      this.loadAvailableMedicines();
    });
    this.medicineSearchControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => this.medicineSearchText = value ?? '');
    this.loadCatalogs();
    this.loadSales();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }
  get details(): UntypedFormArray { return this.form.get('details') as UntypedFormArray; }
  get payments(): UntypedFormArray { return this.form.get('payments') as UntypedFormArray; }
  get openSessions(): any[] { return this.sessions.filter(item => item.status === 'A' && item.branchId === this.form.value.branchId); }

  addItem(): void { this.details.push(this._fb.group({ medicineId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(0.01)]], unitPrice: [null] })); }
  removeItem(index: number): void { if (this.details.length > 1) this.details.removeAt(index); }
  addPayment(): void { this.payments.push(this._fb.group({ method: ['CASH', Validators.required], amount: [0, [Validators.required, Validators.min(0.01)]], receivedAmount: [null], cardBrand: [''], cardLast4: [''], authorizationCode: [''] })); }
  removePayment(index: number): void { if (this.payments.length > 1) this.payments.removeAt(index); }

  loadCatalogs(): void {
    this._api.comboList(['Branch', 'Personal']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([branches, employees]) => {
        this.branches = branches;
        this.employees = employees;
        this.loadSessions();
      },
      error: () => this._toast.error('No se pudieron cargar catalogos.')
    });
  }

  loadAvailableMedicines(): void {
    const branchId = this.form.value.branchId;
    this.medicines = [];
    if (!branchId) return;

    this._api.getInventoryAvailability({ branchId }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.medicines = (resp.success ? resp.data ?? [] : [])
          .filter((item: any) => Number(item.availableToPromise ?? 0) > 0)
          .map((item: any) => ({ id: item.medicineId, name: item.medicineName, availableToPromise: item.availableToPromise }));
      },
      error: () => this._toast.error('No se pudieron cargar medicamentos disponibles.')
    });
  }

  filteredMedicines(): any[] {
    const text = this.medicineSearchText.toLowerCase().trim();
    if (!text) return this.medicines;
    return this.medicines.filter(item => String(item.name ?? '').toLowerCase().includes(text));
  }

  loadSessions(): void {
    this._api.getSessions('A').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => this.sessions = resp.success ? resp.data ?? [] : [],
      error: () => this._toast.error('No se pudieron cargar cajas abiertas.')
    });
  }

  createSale(): void {
    if (this.form.invalid) {
      this._toast.error('Complete los datos de la venta.');
      return;
    }
    this.isLoading = true;
    this._api.add('Sale', this.form.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo registrar la venta.');
        this._toast.success('Venta registrada.');
        this.form.reset({ paymentMethod: 'CASH', taxRate: 0 });
        this.details.clear();
        this.payments.clear();
        this.addItem();
        this.addPayment();
        this.loadSales();
      },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al registrar venta.'); }
    });
  }

  loadSales(event?: PageEvent): void {
    if (event) { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }
    this.isLoading = true;
    this._api.getPaged('Sale', this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.rows = (resp.data?.data ?? []).map((item: any) => ({ ...item, totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}` }));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
      },
      error: () => { this.isLoading = false; this._toast.error('No se pudieron cargar ventas.'); }
    });
  }
}
