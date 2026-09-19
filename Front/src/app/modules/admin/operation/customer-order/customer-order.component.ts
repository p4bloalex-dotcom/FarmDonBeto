import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent } from '@angular/material/paginator';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-order',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, TableComponent],
  templateUrl: './customer-order.component.html',
  styleUrl: './customer-order.component.scss'
})
export class CustomerOrderComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  medicines: any[] = [];
  branches: any[] = [];
  availability: any[] = [];
  rows: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  isLoading = false;
  selectedBranchId: number | null = null;
  private _unsubscribeAll = new Subject<void>();

  columns: TableColumn[] = [
    { field: 'id', header: 'Orden', width: '80px' },
    { field: 'customerName', header: 'Cliente', width: '1.2fr' },
    { field: 'branchName', header: 'Sucursal', width: '1.2fr' },
    { field: 'paymentMethod', header: 'Pago', width: '100px' },
    { field: 'totalLabel', header: 'Total', width: '100px' },
    { field: 'etaLabel', header: 'ETA', width: '90px' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];
  actions: TableAction[] = [
    { action: 'ship', label: 'Enviar', icon: 'heroicons_outline:truck' },
    { action: 'deliver', label: 'Entregar', icon: 'heroicons_outline:check-circle' },
    { action: 'cancel', label: 'Cancelar', icon: 'heroicons_outline:x-circle' }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
      deliveryAddress: ['', Validators.required],
      deliveryLatitude: [null],
      deliveryLongitude: [null],
      deliveryReference: [''],
      paymentMethod: ['COD', Validators.required],
      estimatedDeliveryMinutes: [45, [Validators.required, Validators.min(10)]],
      deliveryFee: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
      items: this._fb.array([])
    });
    this.addItem();
    this.loadCatalogs();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  get items(): UntypedFormArray { return this.form.get('items') as UntypedFormArray; }

  addItem(): void { this.items.push(this._fb.group({ medicineId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(0.01)]] })); }
  removeItem(index: number): void { if (this.items.length > 1) this.items.removeAt(index); }

  loadCatalogs(): void {
    this._api.comboList(['Medicine', 'Branch']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([medicines, branches]) => { this.medicines = medicines; this.branches = branches; },
      error: () => this._toast.error('No se pudieron cargar catalogos.')
    });
  }

  checkAvailability(): void {
    if (this.items.invalid) return;
    this.isLoading = true;
      this._api.customerOrderAvailability({
        deliveryAddress: this.form.value.deliveryAddress,
        deliveryLatitude: this.form.value.deliveryLatitude,
        deliveryLongitude: this.form.value.deliveryLongitude,
        items: this.items.getRawValue()
      }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo consultar disponibilidad.');
        this.availability = resp.data;
        const first = this.availability.find(item => item.canFulfill);
        this.selectedBranchId = first?.branchId ?? null;
        if (first) this.form.patchValue({ estimatedDeliveryMinutes: first.estimatedDeliveryMinutes });
      },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al consultar disponibilidad.'); }
    });
  }

  createOrder(): void {
    if (this.form.invalid || !this.selectedBranchId) {
      this._toast.error('Seleccione una sucursal con disponibilidad.');
      return;
    }
    this.isLoading = true;
    this._api.add('CustomerOrder', { ...this.form.getRawValue(), branchId: this.selectedBranchId }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo registrar la orden.');
        this._toast.success('Orden registrada con inventario reservado.');
        this.form.reset({ paymentMethod: 'COD', estimatedDeliveryMinutes: 45, deliveryFee: 0 });
        this.items.clear();
        this.addItem();
        this.availability = [];
        this.selectedBranchId = null;
        this.loadOrders();
      },
      error: () => { this.isLoading = false; this._toast.error('Error inesperado al crear la orden.'); }
    });
  }

  loadOrders(event?: PageEvent): void {
    if (event) { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }
    this.isLoading = true;
    this._api.getPaged('CustomerOrder', this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.rows = (resp.data?.data ?? []).map(this.decorate);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
      },
      error: () => { this.isLoading = false; this._toast.error('No se pudieron cargar ordenes.'); }
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    const next = event.action === 'ship' ? 'S' : event.action === 'deliver' ? 'D' : 'C';
    this._api.changeStatus('CustomerOrder', event.row.id, { status: next }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => resp.success ? this.loadOrders() : this._toast.error(resp.error?.detail ?? 'No se pudo actualizar la orden.'),
      error: () => this._toast.error('Error inesperado al actualizar orden.')
    });
  }

  private decorate(item: any): any {
    const labels: Record<string, string> = { P: 'Pendiente', S: 'En ruta', D: 'Entregada', C: 'Cancelada' };
    return { ...item, totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}`, etaLabel: `${item.estimatedDeliveryMinutes} min`, statusLabel: labels[item.status] ?? item.status };
  }
}
