import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { SaleReceiptDialogComponent } from './sale-receipt-dialog/sale-receipt-dialog.component';

@Component({
  selector: 'app-sale',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './sale.component.html'
})
export class SaleComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  customerForm: UntypedFormGroup;
  medicines: any[] = [];
  medicineSearchControl: UntypedFormControl = new UntypedFormControl('');
  medicineSearchText = '';
  branches: any[] = [];
  employees: any[] = [];
  sessions: any[] = [];
  isLoading = false;
  currentUserPersonalId: number | string | null = null;
  private autoSyncCashPayment = true;
  private _unsubscribeAll = new Subject<void>();

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog, private _userService: UserService) { }

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
    this.customerForm = this._fb.group({
      documentType: ['RECEIPT', Validators.required],
      taxId: ['CF'],
      customerName: ['Consumidor final'],
      customerPhone: ['']
    });
    this.addItem();
    this.addPayment();
    this.form.get('branchId')!.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.details.controls.forEach(item => item.get('medicineId')?.reset(''));
      this.form.get('cashSessionId')?.reset('', { emitEvent: false });
      this.loadAvailableMedicines();
      this.applySingleOpenSessionDefault();
    });
    this.medicineSearchControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => this.medicineSearchText = value ?? '');
    this.customerForm.get('documentType')!.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(type => this.applyDocumentDefaults(type));
    this.details.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.syncSingleCashPayment());
    this.form.get('taxRate')!.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.syncSingleCashPayment());
    this.payments.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.updatePaymentSyncMode());
    this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUserPersonalId = user?.idPersonal ?? null;
      this.applyLoggedEmployeeDefault();
    });
    this.loadCatalogs();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }
  get details(): UntypedFormArray { return this.form.get('details') as UntypedFormArray; }
  get payments(): UntypedFormArray { return this.form.get('payments') as UntypedFormArray; }
  get openSessions(): any[] { return this.sessions.filter(item => item.status === 'A' && Number(item.branchId) === Number(this.form.value.branchId)); }
  get subtotal(): number { return this.details.controls.reduce((sum, group) => sum + Number(group.value.quantity ?? 0) * Number(group.value.unitPrice ?? 0), 0); }
  get tax(): number { return this.subtotal * (Number(this.form.value.taxRate ?? 0) / 100); }
  get total(): number { return Math.round((this.subtotal + this.tax) * 100) / 100; }
  get paidTotal(): number { return Math.round(this.payments.controls.reduce((sum, group) => sum + Number(group.value.amount ?? 0), 0) * 100) / 100; }
  get balanceDue(): number { return Math.max(0, Math.round((this.total - this.paidTotal) * 100) / 100); }
  get isInvoice(): boolean { return this.customerForm?.value?.documentType === 'INVOICE'; }
  get hasSaleContext(): boolean { return !!this.form?.value?.branchId && !!this.form?.value?.employeeId && !!this.form?.value?.cashSessionId; }
  get canRegisterSale(): boolean { return !this.isLoading && this.form?.valid && this.customerForm?.valid && this.total > 0 && !this.validateSale(); }
  get saleStepHint(): string {
    if (!this.form?.value?.branchId) return 'Seleccione una sucursal para cargar medicamentos disponibles.';
    if (this.openSessions.length === 0) return 'Abra o seleccione una caja activa antes de vender.';
    if (!this.form?.value?.employeeId) return 'Seleccione el cajero responsable.';
    if (!this.form?.value?.cashSessionId) return 'Seleccione la sesion de caja abierta.';
    if (this.isInvoice) return 'Factura FEL activa: complete NIT y nombre antes de cobrar.';
    return 'Recibo consumidor final activo: NIT y nombre no son necesarios.';
  }
  get cashChange(): number {
    return Math.max(0, Math.round((this.paidTotal - this.total) * 100) / 100);
  }

  addItem(): void { this.details.push(this._fb.group({ medicineId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(0.01)]], unitPrice: [null] })); }
  removeItem(index: number): void { if (this.details.length > 1) this.details.removeAt(index); }
  addPayment(): void {
    const amount = this.payments.length === 0 ? this.total : Math.max(0, this.balanceDue);
    this.payments.push(this._fb.group({ method: ['CASH', Validators.required], amount: [amount, [Validators.required, Validators.min(0.01)]], receivedAmount: [null], cardBrand: [''], cardLast4: [''], authorizationCode: [''] }));
    this.autoSyncCashPayment = this.payments.length === 1;
    this.updateMainPaymentMethod();
  }
  removePayment(index: number): void { if (this.payments.length > 1) { this.payments.removeAt(index); this.autoSyncCashPayment = this.payments.length === 1; this.syncSingleCashPayment(); this.updateMainPaymentMethod(); } }

  onPaymentMethodSelected(index: number): void {
    const group = this.payments.at(index);
    if (!group) return;
    group.patchValue({ receivedAmount: null }, { emitEvent: false });
    this.autoSyncCashPayment = this.payments.length === 1 && String(group.value.method).toUpperCase() === 'CASH';
    this.syncSingleCashPayment();
    this.updateMainPaymentMethod();
  }

  showPaymentReference(index: number): boolean {
    return String(this.payments.at(index)?.value?.method ?? '').toUpperCase() !== 'CASH';
  }

  paymentReferenceLabel(index: number): string {
    const method = String(this.payments.at(index)?.value?.method ?? '').toUpperCase();
    if (method === 'CARD') return 'Autorizacion';
    if (method === 'TRANSFER') return 'No. transferencia';
    if (method === 'QR') return 'Codigo QR';
    if (method === 'ONLINE') return 'Referencia online';
    if (method === 'COD') return 'Referencia entrega';
    return 'Referencia';
  }

  private updateMainPaymentMethod(): void {
    if (!this.payments?.length) return;
    const method = this.payments.length > 1 ? 'MIXED' : this.payments.at(0).value.method;
    this.form.get('paymentMethod')?.setValue(method, { emitEvent: false });
  }

  loadCatalogs(): void {
    this._api.comboList(['Branch', 'Personal']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([branches, employees]) => {
        this.branches = branches;
        this.employees = employees;
        this.applySingleOptionDefaults();
        this.applyLoggedEmployeeDefault();
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
          .map((item: any) => ({ id: item.medicineId, name: item.medicineName, availableToPromise: item.availableToPromise, priceSell: Number(item.priceSell ?? 0) }));
        this.applySingleMedicineDefault();
      },
      error: () => this._toast.error('No se pudieron cargar medicamentos disponibles.')
    });
  }

  filteredMedicines(): any[] {
    const text = this.medicineSearchText.toLowerCase().trim();
    const list = text ? this.medicines.filter(item => String(item.name ?? '').toLowerCase().includes(text)) : this.medicines;
    return list.slice(0, 25);
  }

  addMedicineToSale(medicine: any): void {
    const existing = this.details.controls.find(group => Number(group.value.medicineId) === Number(medicine.id));
    if (existing) {
      const current = Number(existing.value.quantity ?? 0);
      const available = Number(medicine.availableToPromise ?? 0);
      existing.patchValue({ quantity: Math.min(current + 1, available), unitPrice: Number(medicine.priceSell ?? 0) });
      this.medicineSearchControl.setValue('');
      return;
    }
    const empty = this.details.controls.find(group => !group.value.medicineId);
    const target = empty ?? this._fb.group({ medicineId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(0.01)]], unitPrice: [null] });
    if (!empty) this.details.push(target);
    target.patchValue({ medicineId: medicine.id, quantity: 1, unitPrice: Number(medicine.priceSell ?? 0) });
    this.medicineSearchControl.setValue('');
  }

  addFirstFilteredMedicine(): void {
    const first = this.filteredMedicines()[0];
    if (first) this.addMedicineToSale(first);
  }

  onMedicineLineSelected(index: number, medicineId: number): void {
    const medicine = this.medicines.find(item => Number(item.id) === Number(medicineId));
    if (!medicine) return;
    this.details.at(index).patchValue({ unitPrice: Number(medicine.priceSell ?? 0) });
  }

  loadSessions(): void {
    this._api.getSessions('A').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.sessions = resp.success ? resp.data ?? [] : [];
        this.applySingleOpenSessionDefault();
      },
      error: () => this._toast.error('No se pudieron cargar cajas abiertas.')
    });
  }

  createSale(): void {
    if (this.form.invalid || this.customerForm.invalid) {
      this._toast.error('Complete los datos de la venta.');
      return;
    }
    const validation = this.validateSale();
    if (validation) {
      this._toast.error(validation);
      return;
    }
    this.isLoading = true;
    this._api.add('Sale', this.salePayload()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo registrar la venta.');
        this.openReceiptDialog(resp.data);
        this._toast.success('Venta registrada.');
        this.form.reset({ paymentMethod: 'CASH', taxRate: 0 });
        this.customerForm.reset({ documentType: 'RECEIPT', taxId: 'CF', customerName: 'Consumidor final', customerPhone: '' });
        this.details.clear();
        this.payments.clear();
        this.autoSyncCashPayment = true;
        this.applySingleOptionDefaults();
        this.applySingleOpenSessionDefault();
        this.addItem();
        this.addPayment();
      },
      error: error => {
        this.isLoading = false;
        this._toast.error(this.saleErrorMessage(error));
      }
    });
  }

  private saleErrorMessage(error: any): string {
    const body = error?.error;
    if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(' ');
    return body?.message ?? body?.error?.detail ?? error?.message ?? 'Error inesperado al registrar venta.';
  }

  private salePayload(): any {
    const payload = this.form.getRawValue();
    return {
      ...payload,
      ...this.customerForm.getRawValue(),
      payments: (payload.payments ?? []).map((payment: any) => ({
        method: payment.method,
        amount: Number(payment.amount ?? 0),
        ...(payment.authorizationCode ? { authorizationCode: payment.authorizationCode } : {})
      }))
    };
  }

  private openReceiptDialog(sale: any): void {
    if (!sale?.receipt) return;
    this._matDialog.open(SaleReceiptDialogComponent, {
      autoFocus: false,
      width: '520px',
      maxWidth: '95vw',
      data: { sale }
    });
  }

  validateSale(): string | null {
    const documentType = this.customerForm.value.documentType;
    if (documentType === 'INVOICE') {
      if (!String(this.customerForm.value.taxId ?? '').trim() || String(this.customerForm.value.taxId).toUpperCase() === 'CF') return 'Para factura ingrese NIT o identificacion fiscal del cliente.';
      if (!String(this.customerForm.value.customerName ?? '').trim() || String(this.customerForm.value.customerName).toLowerCase() === 'consumidor final') return 'Para factura ingrese el nombre del cliente.';
    }
    const branchId = this.form.value.branchId;
    const sessionId = this.form.value.cashSessionId;
    if (!this.sessions.some(item => Number(item.id) === Number(sessionId) && item.status === 'A' && Number(item.branchId) === Number(branchId))) {
      return 'Seleccione una caja abierta de la sucursal de la venta.';
    }
    const details = this.details.controls.map(group => group.getRawValue());
    for (const detail of details) {
      const medicine = this.medicines.find(item => item.id === detail.medicineId);
      const quantity = Number(detail.quantity ?? 0);
      const unitPrice = detail.unitPrice == null || detail.unitPrice === '' ? 0 : Number(detail.unitPrice);
      if (!medicine) return '';
      if (!Number.isFinite(quantity) || quantity <= 0) return 'Ingrese cantidades validas.';
      if (quantity > Number(medicine.availableToPromise ?? 0)) return `La cantidad de ${medicine.name} supera lo disponible (${medicine.availableToPromise}).`;
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return 'Ingrese precios validos.';
    }
    const subtotal = details.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0), 0);
    const total = Math.round((subtotal + subtotal * (Number(this.form.value.taxRate ?? 0) / 100)) * 100) / 100;
    const payments = this.payments.controls.map(group => group.getRawValue());
    const paymentTotal = Math.round(payments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0) * 100) / 100;
    if (paymentTotal + 0.01 < total) return `La suma de pagos debe cubrir Q ${total.toFixed(2)}.`;
    if (paymentTotal - total > 0.01 && !payments.some(item => String(item.method).toUpperCase() === 'CASH')) return 'Solo el efectivo puede quedar como cambio.';
    return null;
  }

  private applyDocumentDefaults(type: string): void {
    const taxId = this.customerForm.get('taxId')!;
    const customerName = this.customerForm.get('customerName')!;
    if (type === 'RECEIPT') {
      this.customerForm.patchValue({ taxId: 'CF', customerName: 'Consumidor final' }, { emitEvent: false });
      taxId.clearValidators();
      customerName.clearValidators();
    } else {
      taxId.setValidators([Validators.required]);
      customerName.setValidators([Validators.required]);
      if (String(taxId.value ?? '').toUpperCase() === 'CF') taxId.setValue('', { emitEvent: false });
      if (String(customerName.value ?? '').toLowerCase() === 'consumidor final') customerName.setValue('', { emitEvent: false });
    }
    taxId.updateValueAndValidity({ emitEvent: false });
    customerName.updateValueAndValidity({ emitEvent: false });
  }

  private applySingleOptionDefaults(): void {
    if (this.branches.length === 1 && !this.form.value.branchId) this.form.get('branchId')?.setValue(this.branches[0].id);
    if (this.employees.length === 1 && !this.form.value.employeeId) this.form.get('employeeId')?.setValue(this.employees[0].id);
  }

  private applyLoggedEmployeeDefault(): void {
    if (!this.currentUserPersonalId || !this.employees.length) return;
    const employee = this.employees.find(item => Number(item.idPersonal ?? item.id) === Number(this.currentUserPersonalId));
    if (employee) this.form.get('employeeId')?.setValue(employee.id ?? employee.idPersonal, { emitEvent: false });
  }

  private applySingleOpenSessionDefault(): void {
    const sessions = this.openSessions;
    if (sessions.length === 1) this.form.get('cashSessionId')?.setValue(sessions[0].id, { emitEvent: false });
  }

  private applySingleMedicineDefault(): void {
    if (this.medicines.length !== 1 || this.details.controls.some(group => group.value.medicineId)) return;
    this.details.at(0).patchValue({ medicineId: this.medicines[0].id, unitPrice: Number(this.medicines[0].priceSell ?? 0) });
  }

  private syncSingleCashPayment(): void {
    if (!this.autoSyncCashPayment || this.payments.length !== 1) return;
    const payment = this.payments.at(0);
    if (String(payment.value.method).toUpperCase() !== 'CASH') return;
    payment.get('amount')?.setValue(this.total, { emitEvent: false });
  }

  private updatePaymentSyncMode(): void {
    if (this.payments.length !== 1) {
      this.autoSyncCashPayment = false;
      return;
    }
    const payment = this.payments.at(0).value;
    this.autoSyncCashPayment = String(payment.method).toUpperCase() === 'CASH' && Math.abs(Number(payment.amount ?? 0) - this.total) < 0.01;
  }
}
