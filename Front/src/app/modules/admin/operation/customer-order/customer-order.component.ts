import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { LocationMapDialogComponent } from 'app/shared/location-map/location-map-dialog.component';
import { LocationMapSelection } from 'app/shared/location-map/location-map.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-order',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule, TableComponent],
  templateUrl: './customer-order.component.html',
  styleUrl: './customer-order.component.scss'
})
export class CustomerOrderComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  searchPhoneControl = new UntypedFormControl('');
  medicines: any[] = [];
  filteredMedicines: any[] = [];
  branches: any[] = [];
  availability: any[] = [];
  geocodeMatches: any[] = [];
  customerHistory: any[] = [];
  rows: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  isLoading = false;
  selectedBranchId: number | null = null;
  selectedOrderDetail: any = null;
  activeStep: 'customer' | 'items' | 'delivery' | 'availability' | 'confirm' | 'manage' = 'customer';
  cancelReason = '';
  private _unsubscribeAll = new Subject<void>();

  columns: TableColumn[] = [
    { field: 'id', header: 'Orden', width: '80px' },
    { field: 'customerName', header: 'Cliente', width: '1.2fr' },
    { field: 'branchName', header: 'Sucursal', width: '1.2fr' },
    { field: 'paymentLabel', header: 'Pago', width: '120px' },
    { field: 'totalLabel', header: 'Total', width: '100px' },
    { field: 'etaLabel', header: 'ETA', width: '90px' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];
  actions: TableAction[] = [
    { action: 'detail', label: 'Detalle', icon: 'heroicons_outline:eye' },
    { action: 'ship', label: 'Enviar', icon: 'heroicons_outline:truck', visible: row => row.status === 'P' },
    { action: 'deliver', label: 'Entregar', icon: 'heroicons_outline:check-circle', visible: row => row.status === 'S' },
    { action: 'cancel', label: 'Cancelar', icon: 'heroicons_outline:x-circle', visible: row => ['P', 'S'].includes(row.status) }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _matDialog: MatDialog, private _toast: HotToastService) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
      deliveryAddress: ['', Validators.required],
      deliveryLatitude: [null],
      deliveryLongitude: [null],
      deliveryReference: [''],
      paymentMethod: ['COD', Validators.required],
      paymentStatus: ['PENDING', Validators.required],
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

  addItem(): void { this.items.push(this._fb.group({ medicineId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(0.01)]] })); this.clearAvailability(); }
  removeItem(index: number): void { if (this.items.length > 1) { this.items.removeAt(index); this.clearAvailability(); } }

  loadCatalogs(): void {
    this._api.comboList(['Medicine', 'Branch']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([medicines, branches]) => { this.medicines = medicines; this.filteredMedicines = medicines; this.branches = branches; },
      error: () => this._toast.error('No se pudieron cargar catalogos.')
    });
  }

  searchCustomer(): void {
    const phone = String(this.searchPhoneControl.value || this.form.value.customerPhone || '').trim();
    if (phone.length < 6) {
      this._toast.error('Ingrese un telefono valido para buscar historial.');
      return;
    }
    this.form.patchValue({ customerPhone: phone });
    this.isLoading = true;
    this._api.customerOrderHistory(phone).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo consultar historial.');
        this.customerHistory = (resp.data ?? []).map(this.decorate);
        const last = this.customerHistory[0];
        if (last) {
          this.form.patchValue({ customerName: last.customerName, deliveryAddress: last.deliveryAddress, deliveryReference: last.deliveryReference, deliveryLatitude: last.deliveryLatitude, deliveryLongitude: last.deliveryLongitude, paymentMethod: last.paymentMethod, paymentStatus: last.paymentMethod === 'COD' ? 'PENDING' : 'PAID' });
        }
        this.activeStep = this.canContinueCustomer ? 'items' : 'customer';
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al consultar historial.')); }
    });
  }

  filterMedicines(term: string): void {
    const text = String(term ?? '').toLowerCase().trim();
    this.filteredMedicines = !text ? this.medicines : this.medicines.filter(item => `${item.code ?? ''} ${item.name ?? ''}`.toLowerCase().includes(text)).slice(0, 25);
  }

  geocodeDeliveryAddress(): void {
    const address = String(this.form.value.deliveryAddress ?? '').trim();
    if (address.length < 5) {
      this._toast.error('Ingrese una direccion de entrega para geolocalizar.');
      return;
    }
    this.isLoading = true;
    this._api.geocodeAddress(address).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo geolocalizar la direccion.');
        this.geocodeMatches = resp.data ?? [];
        const first = this.geocodeMatches[0];
        if (!first) return this._toast.error('No se encontraron coordenadas para esa direccion.');
        this.applyGeocode(first);
        this._toast.success('Direccion geolocalizada.');
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al geolocalizar.')); }
    });
  }

  onDeliveryAddressInput(): void {
    this.form.patchValue({ deliveryLatitude: null, deliveryLongitude: null }, { emitEvent: false });
    this.geocodeMatches = [];
    this.clearAvailability();
  }

  applyGeocode(match: any): void {
    this.form.patchValue({ deliveryLatitude: match.latitude, deliveryLongitude: match.longitude, deliveryAddress: match.label || this.form.value.deliveryAddress });
    this.clearAvailability();
  }

  onDeliveryMapSelected(selection: LocationMapSelection): void {
    this.form.patchValue({
      deliveryLatitude: selection.latitude,
      deliveryLongitude: selection.longitude,
      deliveryAddress: selection.address?.label || this.form.value.deliveryAddress
    });
    if (selection.address) this.geocodeMatches = [selection.address];
    this.clearAvailability();
  }

  openDeliveryMapDialog(): void {
    const dialogRef = this._matDialog.open(LocationMapDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Ubicacion de entrega',
        latitude: this.form.value.deliveryLatitude,
        longitude: this.form.value.deliveryLongitude,
        address: this.geocodeMatches[0]
      },
      width: '94vw',
      maxWidth: '1100px'
    });
    dialogRef.afterClosed().subscribe((selection?: LocationMapSelection) => {
      if (selection) this.onDeliveryMapSelected(selection);
    });
  }

  medicineForLine(index: number): any {
    const id = this.items.at(index)?.value?.medicineId;
    return this.medicines.find(item => Number(item.id) === Number(id));
  }

  lineTotal(index: number): number {
    const item = this.items.at(index)?.value;
    const medicine = this.medicineForLine(index);
    return Number(item?.quantity ?? 0) * Number(medicine?.priceSell ?? medicine?.price_sell ?? 0);
  }

  money(value: any): string {
    return `Q ${Number(value ?? 0).toFixed(2)}`;
  }

  get subtotal(): number { return this.items.controls.reduce((sum, _item, index) => sum + this.lineTotal(index), 0); }
  get total(): number { return this.subtotal + Number(this.form.value.deliveryFee ?? 0); }
  get deliveryFeeAmount(): number { return Number(this.form.value.deliveryFee ?? 0); }
  get selectedBranch(): any { return this.availability.find(item => Number(item.branchId) === Number(this.selectedBranchId)); }
  get canContinueCustomer(): boolean { return this.form.get('customerName')?.valid && this.form.get('customerPhone')?.valid; }
  get hasDeliveryLocation(): boolean { return this.form.get('deliveryAddress')?.valid && this.form.get('deliveryLatitude')?.value != null && this.form.get('deliveryLongitude')?.value != null; }
  get canCheckAvailability(): boolean { return this.form.get('deliveryAddress')?.valid && this.form.get('deliveryLatitude')?.value != null && this.form.get('deliveryLongitude')?.value != null && this.items.valid; }
  get canCreateOrder(): boolean { return this.form.valid && !!this.selectedBranchId && !!this.selectedBranch?.canFulfill; }

  onPaymentMethodChange(method: string): void {
    this.form.patchValue({ paymentStatus: method === 'COD' ? 'PENDING' : 'PAID' });
  }

  selectStep(step: 'customer' | 'items' | 'delivery' | 'availability' | 'confirm' | 'manage'): void {
    if (this.stepState(step) !== 'locked') this.activeStep = step;
  }

  clearAvailability(): void {
    this.availability = [];
    this.selectedBranchId = null;
  }

  checkAvailability(): void {
    if (!this.canCheckAvailability) {
      if (!this.items.valid) { this._toast.error('Seleccione medicamento y cantidad valida.'); return; }
      if (!this.form.get('deliveryAddress')?.valid) { this.activeStep = 'delivery'; this._toast.error('Pregunte y registre la direccion de entrega antes de consultar disponibilidad.'); return; }
      if (this.form.get('deliveryLatitude')?.value == null || this.form.get('deliveryLongitude')?.value == null) { this.activeStep = 'delivery'; this._toast.error('Seleccione coordenadas de entrega con Geolocalizar direccion o Abrir mapa.'); return; }
      this._toast.error('Complete direccion, coordenadas y medicamentos para consultar disponibilidad.');
      return;
    }
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
        this.activeStep = 'availability';
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al consultar disponibilidad.')); }
    });
  }

  createOrder(): void {
    if (!this.canCreateOrder) {
      this._toast.error('Seleccione una sucursal con disponibilidad.');
      return;
    }
    this.isLoading = true;
    this._api.add('CustomerOrder', { ...this.form.getRawValue(), branchId: this.selectedBranchId }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo registrar la orden.');
        this._toast.success('Orden registrada con inventario reservado.');
        this.form.reset({ paymentMethod: 'COD', paymentStatus: 'PENDING', estimatedDeliveryMinutes: 45, deliveryFee: 0 });
        this.searchPhoneControl.reset('');
        this.items.clear();
        this.addItem();
        this.availability = [];
        this.geocodeMatches = [];
        this.customerHistory = [];
        this.selectedBranchId = null;
        this.activeStep = 'customer';
        this.loadOrders();
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al crear la orden.')); }
    });
  }

  loadOrders(event?: PageEvent): void {
    if (event) { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }
    this.isLoading = true;
    this._api.getPaged('CustomerOrder', this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        this.rows = (resp.data?.data ?? []).map(item => this.decorate(item));
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'No se pudieron cargar ordenes.')); }
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'detail') {
      this.loadOrderDetail(event.row.id);
      return;
    }

    const next = event.action === 'ship' ? 'S' : event.action === 'deliver' ? 'D' : 'C';
    if (next === 'S' && event.row.status !== 'P') { this._toast.error('Solo una orden pendiente puede enviarse.'); return; }
    if (next === 'D' && event.row.status !== 'S') { this._toast.error('Solo una orden en ruta puede entregarse.'); return; }
    if (next === 'C' && !['P', 'S'].includes(event.row.status)) { this._toast.error('Solo se pueden cancelar ordenes pendientes o en ruta.'); return; }
    const reason = next === 'C' ? (this.cancelReason || window.prompt('Motivo de cancelacion') || '') : null;
    if (next === 'C' && reason.trim().length < 5) { this._toast.error('Ingrese un motivo de cancelacion de al menos 5 caracteres.'); return; }
    this.isLoading = true;
    this._api.changeStatus('CustomerOrder', event.row.id, { status: next, reason }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) return this.loadOrders();
        this.isLoading = false;
        this._toast.error(resp.error?.detail ?? 'No se pudo actualizar la orden.');
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al actualizar orden.')); }
    });
  }

  loadOrderDetail(id: number): void {
    this.isLoading = true;
    this._api.GetById('CustomerOrder', id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar el detalle de la orden.');
        this.selectedOrderDetail = this.decorate(resp.data);
      },
      error: error => { this.isLoading = false; this._toast.error(this.apiErrorMessage(error, 'Error inesperado al cargar detalle.')); }
    });
  }

  selectHistoryOrder(order: any): void {
    this.form.patchValue({ customerName: order.customerName, customerPhone: order.customerPhone, deliveryAddress: order.deliveryAddress, deliveryReference: order.deliveryReference, deliveryLatitude: order.deliveryLatitude, deliveryLongitude: order.deliveryLongitude, paymentMethod: order.paymentMethod, paymentStatus: order.paymentMethod === 'COD' ? 'PENDING' : 'PAID' });
    this.clearAvailability();
    this.activeStep = 'items';
  }

  selectAvailability(option: any): void {
    if (!option.canFulfill) return;
    this.selectedBranchId = option.branchId;
    this.form.patchValue({ estimatedDeliveryMinutes: option.estimatedDeliveryMinutes });
    this.activeStep = 'confirm';
  }

  stepState(step: string): 'active' | 'done' | 'locked' | 'available' {
    const order = ['customer', 'items', 'delivery', 'availability', 'confirm', 'manage'];
    const current = order.indexOf(this.activeStep);
    const target = order.indexOf(step);
    if (current === target) return 'active';
    if (target < current) return 'done';
    if (step === 'items' && !this.canContinueCustomer) return 'locked';
    if (step === 'delivery' && !this.items.valid) return 'locked';
    if (step === 'availability' && !this.canCheckAvailability) return 'locked';
    if (step === 'confirm' && !this.selectedBranchId) return 'locked';
    return 'available';
  }

  private decorate(item: any): any {
    const labels: Record<string, string> = { P: 'Pendiente', S: 'En ruta', D: 'Entregada', C: 'Cancelada' };
    const payments: Record<string, string> = { COD: 'Contra entrega', CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia' };
    return { ...item, totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}`, etaLabel: `${item.estimatedDeliveryMinutes} min`, statusLabel: labels[item.status] ?? item.status, paymentLabel: payments[item.paymentMethod] ?? item.paymentMethod };
  }

  private apiErrorMessage(error: any, fallback: string): string {
    return error?.error?.error?.detail ?? error?.error?.message ?? error?.message ?? fallback;
  }
}
