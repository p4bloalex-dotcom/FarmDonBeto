import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

type PayrollFlowAction = 'prepare' | 'calculate' | 'review' | 'pay';

@Component({
  selector: 'app-payroll',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TableComponent],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit, OnDestroy {
  positionForm: UntypedFormGroup;
  salaryForm: UntypedFormGroup;
  conceptForm: UntypedFormGroup;
  periodForm: UntypedFormGroup;
  generateForm: UntypedFormGroup;
  adjustmentForm: UntypedFormGroup;
  voidPaymentForm: UntypedFormGroup;
  paymentSourceForm: UntypedFormGroup;
  positions: any[] = [];
  salaries: any[] = [];
  concepts: any[] = [];
  periods: any[] = [];
  payments: any[] = [];
  paymentDetails: any[] = [];
  selectedPayment: any = null;
  paymentToVoid: any = null;
  activePanel: 'period' | 'salary' | 'adjustment' | null = null;
  flowAction: PayrollFlowAction = 'prepare';
  prepareView: 'salaries' | 'adjustments' = 'salaries';
  flowActions = [
    { value: 'prepare', label: 'Preparación' },
    { value: 'calculate', label: 'Calcular nómina' },
    { value: 'review', label: 'Revisar pagos' },
    { value: 'pay', label: 'Aprobar y pagar' }
  ];
  flowSteps: { action: PayrollFlowAction; phase: string; title: string; status: string; description: string }[] = [
    { action: 'prepare', phase: 'Fase 1', title: 'Preparar', status: 'DRAFT', description: 'Datos base.' },
    { action: 'calculate', phase: 'Fase 2', title: 'Calcular', status: 'CALCULATED', description: 'Generar pagos.' },
    { action: 'review', phase: 'Fase 3', title: 'Revisar', status: 'REVIEWED', description: 'Validar pagos.' },
    { action: 'pay', phase: 'Fase 4', title: 'Cerrar', status: 'PAID', description: 'Aprobar y pagar.' }
  ];
  adjustments: any[] = [];
  employees: any[] = [];
  branches: any[] = [];
  financialAccounts: any[] = [];
  sessions: any[] = [];
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  salaryColumns: TableColumn[] = [
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'positionName', header: 'Puesto', width: '1fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'baseSalaryLabel', header: 'Salario', width: '110px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
  ];
  paymentColumns: TableColumn[] = [
    { field: 'paymentDate', header: 'Pago', width: '1fr' },
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'positionName', header: 'Puesto', width: '1fr' },
    { field: 'totalLabel', header: 'Total', width: '110px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
  ];
  paymentActions: TableAction[] = [
    { action: 'details', label: 'Detalle', icon: 'heroicons_outline:document-text' },
    { action: 'void', label: 'Anular', icon: 'heroicons_outline:x-circle', visible: row => row.status === 'E' }
  ];
  adjustmentColumns: TableColumn[] = [
    { field: 'adjustmentDate', header: 'Fecha', width: '1fr' },
    { field: 'employeeName', header: 'Empleado', width: '1.4fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'typeLabel', header: 'Tipo', width: '100px' },
    { field: 'amountLabel', header: 'Monto', width: '110px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' },
    { field: 'reason', header: 'Motivo', width: '1.5fr' }
  ];
  periodColumns: TableColumn[] = [
    { field: 'name', header: 'Periodo', width: '1.4fr' },
    { field: 'branchName', header: 'Sucursal', width: '1fr' },
    { field: 'rangeLabel', header: 'Rango', width: '1.2fr' },
    { field: 'payDate', header: 'Pago', width: '1fr' },
    { field: 'statusLabel', header: 'Estado', width: '120px' }
  ];
  periodActions: TableAction[] = [
    { action: 'CALCULATED', label: 'Calcular', icon: 'heroicons_outline:calculator', visible: row => row.status === 'DRAFT' },
    { action: 'REVIEWED', label: 'Revisar', icon: 'heroicons_outline:eye', visible: row => row.status === 'CALCULATED' },
    { action: 'APPROVED', label: 'Aprobar', icon: 'heroicons_outline:check-circle', visible: row => row.status === 'REVIEWED' },
    { action: 'PAID', label: 'Pagar', icon: 'heroicons_outline:banknotes', visible: row => row.status === 'APPROVED' },
    { action: 'CLOSED', label: 'Cerrar', icon: 'heroicons_outline:lock-closed', visible: row => row.status === 'PAID' }
  ];
  detailColumns: TableColumn[] = [
    { field: 'conceptName', header: 'Concepto', width: '1fr' },
    { field: 'typeLabel', header: 'Tipo', width: '120px' },
    { field: 'amountLabel', header: 'Monto', width: '120px' },
    { field: 'description', header: 'Detalle', width: '1fr' }
  ];
  conceptColumns: TableColumn[] = [
    { field: 'code', header: 'Código', width: '120px' },
    { field: 'name', header: 'Concepto', width: '1.4fr' },
    { field: 'typeLabel', header: 'Tipo', width: '120px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService) { }

  ngOnInit(): void {
    this.positionForm = this._fb.group({ name: ['', Validators.required], description: [''], status: ['E'] });
    this.conceptForm = this._fb.group({ code: ['', Validators.required], name: ['', Validators.required], type: ['INCOME', Validators.required], isAutomatic: [false], status: ['E'] });
    this.periodForm = this._fb.group({ name: ['', Validators.required], branchId: [''], dateStart: ['', Validators.required], dateEnd: ['', Validators.required], payDate: ['', Validators.required], periodType: ['MONTHLY', Validators.required], status: ['DRAFT'] });
    this.salaryForm = this._fb.group({ employeeId: ['', Validators.required], positionId: ['', Validators.required], branchId: ['', Validators.required], baseSalary: [0, [Validators.required, Validators.min(0.01)]], effectiveFrom: ['', Validators.required], notes: [''] });
    this.generateForm = this._fb.group({ periodId: [''], branchId: [''], periodStart: [''], periodEnd: [''], paymentDate: [''], defaultBonus: [0], defaultDeduction: [0], notes: [''] });
    this.adjustmentForm = this._fb.group({ employeeId: ['', Validators.required], branchId: ['', Validators.required], type: ['B', Validators.required], amount: [0, [Validators.required, Validators.min(0.01)]], adjustmentDate: [''], reason: ['', Validators.required] });
    this.voidPaymentForm = this._fb.group({ reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]] });
    this.paymentSourceForm = this._fb.group({ paymentSourceType: ['CASH_SESSION', Validators.required], financialAccountId: [''], cashSessionId: [''] });
    this.generateForm.get('periodId')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => this.onPeriodChanged());
    this.salaryForm.get('employeeId')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(employeeId => this.syncEmployeeBranch(this.salaryForm, employeeId));
    this.adjustmentForm.get('employeeId')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(employeeId => this.syncEmployeeBranch(this.adjustmentForm, employeeId));
    this.loadCatalogs();
    this.refreshAll();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  loadCatalogs(): void {
    this._api.comboList(['Personal', 'Branch']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([employees, branches]) => {
        this.employees = employees;
        this.branches = branches;
        this.applySingleOptionDefaults();
      },
      error: () => this._toast.error('No se pudieron cargar catálogos.')
    });
    this._api.getTreasury('accounts').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.financialAccounts = resp.success ? (resp.data ?? []).filter(item => item.status === 'E') : []);
    this._api.getSessions('A').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { this.sessions = resp.success ? resp.data ?? [] : []; this.applySingleOpenSessionDefault(); },
      error: () => this._toast.error('No se pudieron cargar cajas abiertas.')
    });
  }

  refreshAll(): void {
    this.isLoading = true;
    this._api.getPayroll('positions').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => { this.positions = resp.success ? resp.data ?? [] : []; this.applySingleOptionDefaults(); });
    this._api.getPayroll('concepts').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.concepts = resp.success ? (resp.data ?? []).map(item => this.decorateConcept(item)) : []);
    this._api.getPayroll('periods').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => { this.periods = resp.success ? this.sortByRecent((resp.data ?? []).map(item => this.decoratePeriod(item)), 'dateStart') : []; this.applySingleOptionDefaults(); });
    this._api.getPayroll('salaries').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.salaries = resp.success ? this.sortByRecent((resp.data ?? []).map(item => this.decorateSalary(item)), 'effectiveFrom') : []);
    this._api.getPayroll('adjustments').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.adjustments = resp.success ? this.sortByRecent((resp.data ?? []).map(item => this.decorateAdjustment(item)), 'adjustmentDate') : []);
    this._api.getPayroll('payments').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { this.payments = resp.success ? this.sortByRecent((resp.data ?? []).map(item => this.decoratePayment(item)), 'paymentDate') : []; this.isLoading = false; },
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

  saveConcept(): void {
    if (this.conceptForm.invalid) return;
    this._api.postPayroll('concepts', this.conceptForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => { resp.success ? (this.conceptForm.reset({ type: 'INCOME', isAutomatic: false, status: 'E' }), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo guardar concepto.'); },
      error: () => this._toast.error('Error inesperado al guardar concepto.')
    });
  }

  savePeriod(): void {
    if (this.periodForm.invalid) return;
    this._api.postPayroll('periods', this.periodForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo guardar período.');
          return;
        }
        const periodId = resp.data?.id;
        this.periodForm.reset({ periodType: 'MONTHLY', status: 'DRAFT' });
        this.closePanel();
        this.flowAction = 'calculate';
        this.refreshAll();
        if (periodId) this.generateForm.patchValue({ periodId });
      },
      error: () => this._toast.error('Error inesperado al guardar periodo.')
    });
  }

  saveSalary(): void {
    if (!this.canPrepare) { this._toast.error('No se pueden modificar salarios en este estado.'); return; }
    if (this.salaryForm.invalid) return;
    this._api.postPayroll('salaries', this.salaryForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo asignar salario.');
          return;
        }
        this.salaryForm.reset();
        this.flowAction = 'prepare';
        this.prepareView = 'salaries';
        this.closePanel();
        this.refreshAll();
      },
      error: () => this._toast.error('Error inesperado al asignar salario.')
    });
  }

  generatePayroll(): void {
    if (!this.canGenerate) { this._toast.error('Este período no permite calcular nómina.'); return; }
    if (this.generateForm.invalid) return;
    this.isLoading = true;
    this._api.postPayroll('generate', this.payrollGeneratePayload()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (resp.success) {
          this._toast.success('Nómina generada.');
          this.flowAction = 'review';
          this.refreshAll();
          return;
        }
        this._toast.error(resp.error?.detail ?? 'No se pudo generar nómina.');
      },
      error: error => { this.isLoading = false; this._toast.error(error?.error?.error?.detail ?? error?.error?.message ?? 'Error inesperado al generar nómina.'); }
    });
  }

  saveAdjustment(): void {
    if (!this.canPrepare) { this._toast.error('No se pueden registrar ajustes en este estado.'); return; }
    if (this.adjustmentForm.invalid) return;
    this._api.postPayroll('adjustments', this.adjustmentForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo guardar ajuste.');
          return;
        }
        this.adjustmentForm.reset({ type: 'B', amount: 0 });
        this.flowAction = 'prepare';
        this.prepareView = 'adjustments';
        this.closePanel();
        this.refreshAll();
      },
      error: () => this._toast.error('Error inesperado al guardar ajuste.')
    });
  }

  handlePaymentAction(event: { action: string; row: any }): void {
    if (event.action === 'details') {
      this.selectedPayment = event.row;
      this._api.getPayrollPaymentDetails(event.row.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: resp => this.paymentDetails = resp.success ? (resp.data ?? []).map(item => this.decorateDetail(item)) : [],
        error: () => this._toast.error('No se pudo cargar el detalle.')
      });
      return;
    }
    if (event.action !== 'void') return;
    this.paymentToVoid = event.row;
    this.voidPaymentForm.reset();
  }

  confirmVoidPayment(): void {
    if (this.voidPaymentForm.invalid || !this.paymentToVoid) return;
    const reason = this.voidPaymentForm.get('reason')?.value;
    this._api.voidPayrollPayment(this.paymentToVoid.id, reason).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo anular pago.');
          return;
        }
        this.paymentToVoid = null;
        this.voidPaymentForm.reset();
        this.refreshAll();
      },
      error: error => this._toast.error(this.apiErrorMessage(error, 'Error inesperado al anular pago.'))
    });
  }

  cancelVoidPayment(): void { this.paymentToVoid = null; this.voidPaymentForm.reset(); }

  handlePeriodAction(event: { action: string; row: any }): void {
    if (!this.canRunPeriodAction(event.action, event.row)) {
      this._toast.error('Acción no permitida para el estado actual del período.');
      return;
    }
    if (event.action === 'CALCULATED') {
      this.generateForm.patchValue({ periodId: event.row.id });
      this.generatePayroll();
      return;
    }

    const payload = event.action === 'PAID' ? this.payrollPaymentSourcePayload(event.action) : event.action;
    this._api.updatePayrollPeriodStatus(event.row.id, payload).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo actualizar el periodo.');
          return;
        }
        this.flowAction = this.recommendedFlowAction(event.action);
        this.refreshAll();
      },
      error: error => this._toast.error(this.apiErrorMessage(error, 'Error inesperado al actualizar periodo.'))
    });
  }

  openPanel(panel: 'period' | 'salary' | 'adjustment'): void {
    if ((panel === 'salary' || panel === 'adjustment') && !this.canPrepare) {
      this._toast.error('No se puede editar la preparación en este estado.');
      return;
    }
    this.activePanel = this.activePanel === panel ? null : panel;
  }
  closePanel(): void { this.activePanel = null; }
  selectFlowAction(action: PayrollFlowAction): void {
    if (!this.canOpenFlowAction(action)) {
      this._toast.error('Completa el paso actual antes de continuar.');
      return;
    }
    this.flowAction = action;
    this.activePanel = null;
  }
  selectPrepareView(view: 'salaries' | 'adjustments'): void { this.prepareView = view; }

  get selectedPeriod(): any { return this.periods.find(item => item.id === this.generateForm?.get('periodId')?.value) ?? null; }
  get manualGeneration(): boolean { return !this.selectedPeriod; }
  get canPrepare(): boolean { return !this.selectedPeriod || this.selectedPeriod.status === 'DRAFT'; }
  get canGenerate(): boolean { return this.selectedPeriod ? this.selectedPeriod.status === 'DRAFT' : !!this.generateForm?.get('periodStart')?.value && !!this.generateForm?.get('periodEnd')?.value; }
  get periodPayments(): any[] { return this.selectedPeriod ? this.payments.filter(item => item.periodId === this.selectedPeriod.id) : this.payments; }
  get payrollTotal(): number { return this.periodPayments.reduce((sum, item) => sum + Number(item.total ?? 0), 0); }
  get payrollTotalLabel(): string { return `Q ${this.payrollTotal.toFixed(2)}`; }
  get payrollPaymentAccounts(): any[] { return this.financialAccounts.filter(item => item.type === this.paymentSourceForm?.get('paymentSourceType')?.value); }
  get openPayrollSessions(): any[] {
    const branchId = this.selectedPeriod?.branchId ?? this.generateForm?.get('branchId')?.value;
    return this.sessions.filter(item => item.status === 'A' && (!branchId || Number(item.branchId) === Number(branchId)));
  }
  get canMarkSelectedPeriodReviewed(): boolean { return this.selectedPeriod?.status === 'CALCULATED'; }
  get selectedPeriodAction(): { action: string; label: string } | null {
    const actions: Record<string, { action: string; label: string }> = {
      REVIEWED: { action: 'APPROVED', label: 'Aprobar' },
      APPROVED: { action: 'PAID', label: 'Pagar' },
      PAID: { action: 'CLOSED', label: 'Cerrar' }
    };
    return actions[this.selectedPeriod?.status] ?? null;
  }
  get salaryEmployees(): any[] { return this.employees; }
  get adjustmentEmployees(): any[] {
    const branchId = this.adjustmentForm?.get('branchId')?.value;
    return branchId ? this.employees.filter(item => (item.branchId ?? item.branch_id ?? null) === branchId) : this.employees;
  }
  get currentPhase(): any { return this.flowSteps.find(item => item.action === this.flowAction) ?? this.flowSteps[0]; }
  get nextStepLabel(): string {
    if (!this.selectedPeriod) return 'Siguiente: calcular manual';
    const labels: Record<string, string> = { DRAFT: 'Siguiente: calcular', CALCULATED: 'Siguiente: revisar', REVIEWED: 'Siguiente: aprobar', APPROVED: 'Siguiente: pagar', PAID: 'Siguiente: cerrar', CLOSED: 'Finalizado' };
    return labels[this.selectedPeriod.status] ?? 'Selecciona período';
  }
  get periodFlowHint(): string {
    if (!this.selectedPeriod) return 'Modo manual';
    const hints: Record<string, string> = {
      DRAFT: 'Borrador',
      CALCULATED: 'Calculado',
      REVIEWED: 'Revisado',
      APPROVED: 'Aprobado',
      PAID: 'Pagado',
      CLOSED: 'Cerrado'
    };
    return hints[this.selectedPeriod.status] ?? 'Sin estado';
  }

  stepState(step: any): 'done' | 'active' | 'locked' | 'available' {
    const currentIndex = this.flowSteps.findIndex(item => item.action === this.flowAction);
    const stepIndex = this.flowSteps.findIndex(item => item.action === step.action);
    if (stepIndex === currentIndex) return 'active';
    if (!this.selectedPeriod) return this.canOpenFlowAction(step.action) ? 'available' : 'locked';
    const statusOrder = ['DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PAID', 'CLOSED'];
    const periodIndex = statusOrder.indexOf(this.selectedPeriod.status);
    const targetIndex = statusOrder.indexOf(step.status);
    if (periodIndex >= targetIndex) return 'done';
    if (!this.canOpenFlowAction(step.action)) return 'locked';
    return stepIndex < currentIndex ? 'done' : 'available';
  }

  canOpenFlowAction(action: PayrollFlowAction): boolean {
    if (!this.selectedPeriod) return action === 'prepare' || action === 'calculate' || action === 'review';
    const status = this.selectedPeriod.status;
    if (action === 'prepare' || action === 'calculate') return status === 'DRAFT';
    if (action === 'review') return ['CALCULATED', 'REVIEWED', 'APPROVED', 'PAID', 'CLOSED'].includes(status);
    return ['REVIEWED', 'APPROVED', 'PAID', 'CLOSED'].includes(status);
  }

  canRunPeriodAction(action: string, row: any): boolean {
    const transitions: Record<string, string> = { CALCULATED: 'DRAFT', REVIEWED: 'CALCULATED', APPROVED: 'REVIEWED', PAID: 'APPROVED', CLOSED: 'PAID' };
    return row?.status === transitions[action];
  }

  markSelectedPeriodReviewed(): void {
    if (!this.selectedPeriod) return;
    this.handlePeriodAction({ action: 'REVIEWED', row: this.selectedPeriod });
  }

  runSelectedPeriodAction(): void {
    if (!this.selectedPeriodAction || !this.selectedPeriod) return;
    this.handlePeriodAction({ action: this.selectedPeriodAction.action, row: this.selectedPeriod });
  }

  private onPeriodChanged(): void {
    const period = this.selectedPeriod;
    if (!period) {
      this.flowAction = 'prepare';
      this.activePanel = null;
      return;
    }
    this.generateForm.patchValue({ branchId: period.branchId ?? '', periodStart: period.dateStart, periodEnd: period.dateEnd, paymentDate: period.payDate }, { emitEvent: false });
    this.paymentSourceForm.patchValue({ cashSessionId: '' }, { emitEvent: false });
    this.applySingleOpenSessionDefault();
    this.flowAction = this.recommendedFlowAction(period.status);
    this.activePanel = null;
  }

  private recommendedFlowAction(status: string): PayrollFlowAction {
    if (status === 'DRAFT') return 'prepare';
    if (status === 'CALCULATED') return 'review';
    return 'pay';
  }

  private sortByRecent(items: any[], dateField: string): any[] {
    return [...items].sort((a, b) => {
      const dateDiff = new Date(b?.[dateField] ?? 0).getTime() - new Date(a?.[dateField] ?? 0).getTime();
      return dateDiff || Number(b?.id ?? 0) - Number(a?.id ?? 0);
    });
  }

  private syncEmployeeBranch(form: UntypedFormGroup, employeeId: any): void {
    const employee = this.employees.find(item => item.id === employeeId);
    if (employee?.branchId || employee?.branch_id) form.patchValue({ branchId: employee.branchId ?? employee.branch_id }, { emitEvent: false });
  }

  private applySingleOptionDefaults(): void {
    if (this.branches.length === 1) {
      const branchId = this.branches[0].id;
      if (!this.periodForm.get('branchId')?.value) this.periodForm.patchValue({ branchId }, { emitEvent: false });
      if (!this.generateForm.get('branchId')?.value) this.generateForm.patchValue({ branchId }, { emitEvent: false });
      if (!this.salaryForm.get('branchId')?.value) this.salaryForm.patchValue({ branchId }, { emitEvent: false });
      if (!this.adjustmentForm.get('branchId')?.value) this.adjustmentForm.patchValue({ branchId }, { emitEvent: false });
    }
    if (this.periods.length === 1 && !this.generateForm.get('periodId')?.value) this.generateForm.patchValue({ periodId: this.periods[0].id });
    if (this.positions.length === 1 && !this.salaryForm.get('positionId')?.value) this.salaryForm.patchValue({ positionId: this.positions[0].id }, { emitEvent: false });
  }

  private applySingleOpenSessionDefault(): void {
    const sessions = this.openPayrollSessions;
    if (sessions.length === 1) this.paymentSourceForm.get('cashSessionId')?.setValue(sessions[0].id, { emitEvent: false });
  }

  private payrollGeneratePayload(): any {
    const payload = this.generateForm.getRawValue();
    return {
      ...payload,
      periodId: payload.periodId || null,
      branchId: payload.branchId || null,
      periodStart: payload.periodStart || null,
      periodEnd: payload.periodEnd || null,
      paymentDate: payload.paymentDate || null,
      defaultBonus: Number(payload.defaultBonus ?? 0),
      defaultDeduction: Number(payload.defaultDeduction ?? 0),
      notes: payload.notes || null
    };
  }

  private payrollPaymentSourcePayload(status: string): any {
    const sourceType = this.paymentSourceForm.get('paymentSourceType')?.value;
    return {
      status,
      paymentSourceType: sourceType,
      financialAccountId: sourceType === 'CASH_SESSION' ? null : this.paymentSourceForm.get('financialAccountId')?.value || null,
      cashSessionId: sourceType === 'CASH_SESSION' ? this.paymentSourceForm.get('cashSessionId')?.value || null : null
    };
  }

  private statusLabel(status: string): string {
    const labels: Record<string, string> = { DRAFT: 'Borrador', CALCULATED: 'Calculado', REVIEWED: 'Revisado', APPROVED: 'Aprobado', PAID: 'Pagado', CLOSED: 'Cerrado', E: 'Activo', D: 'Inactivo', A: 'Aplicado', P: 'Pendiente', I: 'Anulado' };
    return labels[status] ?? status ?? '-';
  }

  private decorateSalary(item: any): any { return { ...item, baseSalaryLabel: `Q ${Number(item.baseSalary ?? 0).toFixed(2)}`, statusLabel: this.statusLabel(item.status) }; }
  private decoratePayment(item: any): any { return { ...item, totalLabel: `Q ${Number(item.total ?? 0).toFixed(2)}`, statusLabel: this.statusLabel(item.status) }; }
  private decorateAdjustment(item: any): any { return { ...item, typeLabel: item.type === 'B' ? 'Bono' : 'Deducción', amountLabel: `Q ${Number(item.amount ?? 0).toFixed(2)}`, statusLabel: this.statusLabel(item.status) }; }
  private decorateConcept(item: any): any { return { ...item, typeLabel: item.type === 'INCOME' ? 'Ingreso' : 'Deducción', statusLabel: this.statusLabel(item.status) }; }
  private decoratePeriod(item: any): any { return { ...item, branchName: item.branchName ?? 'Todas', statusLabel: this.statusLabel(item.status), rangeLabel: `${String(item.dateStart ?? '').slice(0, 10)} / ${String(item.dateEnd ?? '').slice(0, 10)}` }; }
  private decorateDetail(item: any): any { return { ...item, typeLabel: item.type === 'INCOME' ? 'Ingreso' : 'Deducción', amountLabel: `Q ${Number(item.amount ?? 0).toFixed(2)}` }; }
  private apiErrorMessage(error: any, fallback: string): string { return error?.error?.error?.detail ?? error?.error?.message ?? fallback; }
}
