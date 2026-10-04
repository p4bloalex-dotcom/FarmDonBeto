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
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-treasury',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TableComponent],
  templateUrl: './treasury.component.html'
})
export class TreasuryComponent implements OnInit, OnDestroy {
  accountForm: UntypedFormGroup;
  movementForm: UntypedFormGroup;
  transferForm: UntypedFormGroup;
  reconcileForm: UntypedFormGroup;
  reverseForm: UntypedFormGroup;
  accounts: any[] = [];
  movements: any[] = [];
  summary: any = {};
  selectedMovement: any = null;
  panel: 'account' | 'movement' | 'transfer' | 'reconcile' | 'reverse' | null = null;
  isLoading = false;
  private _unsubscribeAll = new Subject<void>();

  accountColumns: TableColumn[] = [
    { field: 'name', header: 'Cuenta/Fondo', width: '1.4fr' },
    { field: 'typeLabel', header: 'Tipo', width: '120px' },
    { field: 'accountNumber', header: 'No.', width: '120px' },
    { field: 'balanceLabel', header: 'Saldo', width: '120px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
  ];
  movementColumns: TableColumn[] = [
    { field: 'movementDateLabel', header: 'Fecha', width: '120px' },
    { field: 'sourceLabel', header: 'Origen', width: '1fr' },
    { field: 'operationLabel', header: 'Oper.', width: '90px' },
    { field: 'amountLabel', header: 'Monto', width: '110px' },
    { field: 'description', header: 'Descripción', width: '1.6fr' },
    { field: 'reconciledLabel', header: 'Conciliado', width: '110px' },
    { field: 'statusLabel', header: 'Estado', width: '100px' }
  ];
  movementActions: TableAction[] = [
    { action: 'reconcile', label: 'Conciliar', icon: 'heroicons_outline:check', visible: row => row.status === 'E' && !row.reconciledAt },
    { action: 'reverse', label: 'Anular', icon: 'heroicons_outline:arrow-uturn-left', visible: row => row.status === 'E' && !row.reconciledAt }
  ];

  constructor(private _fb: UntypedFormBuilder, private _api: GeneralApiService, private _toast: HotToastService) {}

  ngOnInit(): void {
    this.accountForm = this._fb.group({ name: ['', Validators.required], type: ['BANK', Validators.required], accountNumber: [''], openingBalance: [0], status: ['E'] });
    this.movementForm = this._fb.group({ sourceType: ['BANK', Validators.required], financialAccountId: [''], operation: ['E', Validators.required], amount: [0, [Validators.required, Validators.min(0.01)]], description: ['', Validators.required], movementDate: [''] });
    this.transferForm = this._fb.group({ fromAccountId: ['', Validators.required], toAccountId: ['', Validators.required], amount: [0, [Validators.required, Validators.min(0.01)]], description: [''], movementDate: [''] });
    this.reconcileForm = this._fb.group({ note: [''] });
    this.reverseForm = this._fb.group({ reason: ['', [Validators.required, Validators.minLength(5)]] });
    this.refreshAll();
  }

  ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

  refreshAll(): void {
    this.isLoading = true;
    this._api.getTreasury('summary').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.summary = resp.success ? resp.data ?? {} : {});
    this._api.getTreasury('accounts').pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => this.accounts = resp.success ? (resp.data ?? []).map(item => this.decorateAccount(item)) : []);
    this._api.getTreasury('movements').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { this.movements = resp.success ? this.sortByRecent((resp.data ?? []).map(item => this.decorateMovement(item))) : []; this.isLoading = false; },
      error: () => { this.isLoading = false; this._toast.error('No se pudo cargar tesorería.'); }
    });
  }

  saveAccount(): void { this.submit(this._api.postTreasury('accounts', this.accountForm.getRawValue()), 'Cuenta registrada.', () => this.accountForm.reset({ type: 'BANK', openingBalance: 0, status: 'E' })); }
  saveMovement(): void { this.submit(this._api.postTreasury('movements', this.cleanPayload(this.movementForm.getRawValue())), 'Movimiento registrado.', () => this.movementForm.reset({ sourceType: 'BANK', operation: 'E', amount: 0 })); }
  saveTransfer(): void { this.submit(this._api.postTreasury('transfers', this.cleanPayload(this.transferForm.getRawValue())), 'Transferencia registrada.', () => this.transferForm.reset({ amount: 0 })); }
  confirmReconcile(): void { if (!this.selectedMovement) return; this.submit(this._api.patchTreasury('movements', this.selectedMovement.id, 'reconcile', this.reconcileForm.getRawValue()), 'Movimiento conciliado.', () => this.cancelAction()); }
  confirmReverse(): void { if (!this.selectedMovement) return; this.submit(this._api.patchTreasury('movements', this.selectedMovement.id, 'reverse', this.reverseForm.getRawValue()), 'Movimiento anulado.', () => this.cancelAction()); }

  handleMovementAction(event: { action: string; row: any }): void {
    this.selectedMovement = event.row;
    this.panel = event.action as any;
    this.reconcileForm.reset();
    this.reverseForm.reset();
  }

  open(panel: 'account' | 'movement' | 'transfer'): void { this.panel = this.panel === panel ? null : panel; this.selectedMovement = null; }
  openMovement(operation: 'E' | 'S'): void { this.open('movement'); this.movementForm.patchValue({ operation }); }
  cancelAction(): void { this.panel = null; this.selectedMovement = null; this.reconcileForm.reset(); this.reverseForm.reset(); }

  get activeAccounts(): any[] { return this.accounts.filter(item => item.status === 'E'); }
  get bankOrFundAccounts(): any[] { return this.activeAccounts.filter(item => ['BANK', 'CASH_FUND'].includes(item.type)); }
  get movementAccounts(): any[] { return this.bankOrFundAccounts.filter(item => item.type === this.movementForm?.get('sourceType')?.value); }
  get selectedMovementOperationLabel(): string { return this.movementForm?.get('operation')?.value === 'E' ? 'Ingreso' : 'Egreso'; }

  private submit(request: any, successMessage: string, done: () => void): void {
    request.pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { resp.success ? (this._toast.success(successMessage), done(), this.refreshAll()) : this._toast.error(resp.error?.detail ?? 'No se pudo completar la operación.'); },
      error: error => this._toast.error(error?.error?.error?.detail ?? error?.error?.message ?? 'Error inesperado.')
    });
  }

  private cleanPayload(payload: any): any { return Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v === '' ? null : v])); }
  private sortByRecent(items: any[]): any[] { return [...items].sort((a, b) => new Date(b?.movementDate ?? 0).getTime() - new Date(a?.movementDate ?? 0).getTime() || Number(b?.id ?? 0) - Number(a?.id ?? 0)); }
  private money(value: any): string { return `Q ${Number(value ?? 0).toFixed(2)}`; }
  private typeLabel(type: string): string { return type === 'BANK' ? 'Banco' : type === 'CASH_FUND' ? 'Fondo' : 'Caja turno'; }
  private decorateAccount(item: any): any { return { ...item, typeLabel: this.typeLabel(item.type), balanceLabel: this.money(item.balance), statusLabel: item.status === 'E' ? 'Activo' : 'Inactivo' }; }
  private decorateMovement(item: any): any { return { ...item, movementDateLabel: String(item.movementDate ?? '').slice(0, 10), sourceLabel: item.financialAccountName ?? (item.cashSessionId ? `Caja #${item.cashSessionId}` : this.typeLabel(item.sourceType)), operationLabel: item.operation === 'E' ? 'Ingreso' : 'Egreso', amountLabel: this.money(item.amount), reconciledLabel: item.reconciledAt ? 'Sí' : 'No', statusLabel: item.status === 'E' ? 'Activo' : item.status === 'R' ? 'Reversado' : item.status }; }
}
