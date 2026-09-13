import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { CellFormatPipe } from '@fuse/pipes/cellFormatPipe.pipe';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';
import { CashCloseDialogComponent } from './cash-close-dialog/cash-close-dialog.component';
import { CashMovementDialogComponent } from './cash-movement-dialog/cash-movement-dialog.component';
import { CashOpenDialogComponent } from './cash-open-dialog/cash-open-dialog.component';

@Component({
  selector: 'app-cash-flow',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatProgressBarModule, TableComponent, CellFormatPipe],
  templateUrl: './cash-flow.component.html',
  styleUrl: './cash-flow.component.scss'
})
export class CashFlowComponent implements OnInit, OnDestroy {
  registers: any[] = [];
  selectedRegisterId: number | null = null;
  sessions: any[] = [];
  openSession: any = null;
  movements: any[] = [];
  summary: any = { income: 0, expense: 0, expectedAmount: 0 };
  closedSessions: any[] = [];
  movementTypes: any[] = [];
  isLoading = false;

  movementColumns: TableColumn[] = [
    { field: 'movementTypeName', header: 'Tipo', width: '1.5fr' },
    { field: 'description', header: 'Detalle', width: '2fr' },
    { field: 'amountLabel', header: 'Monto', width: '1fr' },
    { field: 'movementDate', header: 'Hora', width: '1fr', hideAt: 'sm' }
  ];

  movementActions: TableAction[] = [
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
  ];

  historyColumns: TableColumn[] = [
    { field: 'openingDate', header: 'Apertura', width: '1fr' },
    { field: 'closingDate', header: 'Cierre', width: '1fr', hideAt: 'sm' },
    { field: 'openingAmount', header: 'Inicial', width: '1fr' },
    { field: 'expectedAmount', header: 'Esperado', width: '1fr', hideAt: 'sm' },
    { field: 'closingAmount', header: 'Contado', width: '1fr' },
    { field: 'differenceAmount', header: 'Diferencia', width: '1fr' },
    { field: 'status', header: 'Estado', width: '1fr' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this._generalApi.getList('CashRegister').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'Error al cargar las cajas.');
          this.isLoading = false;
          return;
        }
        this.registers = resp.data ?? [];
        if (this.registers.length && this.selectedRegisterId === null) {
          this.selectedRegisterId = this.registers[0].id;
        }
        this.loadMovementTypes();
      },
      error: () => this.finishLoad('Error inesperado al cargar las cajas.')
    });
  }

  loadMovementTypes(): void {
    this._generalApi.getList('CashMovementType').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.movementTypes = resp.success ? resp.data ?? [] : [];
        this.loadSessions();
      },
      error: () => this.finishLoad('Error inesperado al cargar los tipos de movimiento.')
    });
  }

  loadSessions(): void {
    this._generalApi.getSessions().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'Error al cargar las sesiones.');
          this.isLoading = false;
          return;
        }
        this.sessions = resp.data ?? [];
        const openAny = this.sessions.find(session => session.status === 'A');
        if (this.selectedRegisterId === null && openAny) {
          this.selectedRegisterId = openAny.cashRegisterId;
        }
        this.applyRegisterContext();
      },
      error: () => this.finishLoad('Error inesperado al cargar las sesiones.')
    });
  }

  applyRegisterContext(): void {
    const registerId = this.selectedRegisterId;
    this.openSession = this.sessions.find(session => session.status === 'A' && session.cashRegisterId === registerId) ?? null;
    this.closedSessions = this.sessions.filter(session => session.cashRegisterId === registerId && session.status !== 'A');
    this.refreshSessionDetails();
  }

  onRegisterChange(): void {
    this.applyRegisterContext();
  }

  refreshSessionDetails(): void {
    if (!this.openSession) {
      this.movements = [];
      this.summary = { income: 0, expense: 0, expectedAmount: 0 };
      this.isLoading = false;
      return;
    }

    const sessionId = this.openSession.id;
    this._generalApi.getMovementsBySession(sessionId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this.movements = (resp.data ?? []).map((movement: any) => ({
            ...movement,
            amountLabel: `${movement.movementTypeOperation === 'I' ? '+' : '-'}${Number(movement.amount ?? 0).toFixed(2)}`
          }));
        }
        this.loadBalance(sessionId);
      },
      error: () => this.loadBalance(sessionId)
    });
  }

  loadBalance(sessionId: number): void {
    this._generalApi.getSessionBalance(sessionId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this.summary = resp.data?.summary ?? { income: 0, expense: 0, expectedAmount: 0 };
        }
        this.isLoading = false;
      },
      error: () => this.finishLoad('Error inesperado al calcular el balance.')
    });
  }

  openCashDialog(): void {
    const dialogRef = this._matDialog.open(CashOpenDialogComponent, {
      autoFocus: false,
      data: { registers: this.registers, selectedRegisterId: this.selectedRegisterId },
      width: '92vw',
      maxWidth: '520px',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(payload => {
      if (!payload) return;
      this.isLoading = true;
      this._generalApi.add('CashSession', {
        cashRegisterId: payload.cashRegisterId,
        openingAmount: payload.openingAmount
      }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this._toast.success('Caja abierta correctamente.');
            this.selectedRegisterId = payload.cashRegisterId;
            this.loadSessions();
          } else {
            this._toast.error(resp.error?.detail ?? 'No se pudo abrir la caja.');
            this.isLoading = false;
          }
        },
        error: () => this.finishLoad('Error inesperado al abrir la caja.')
      });
    });
  }

  addMovement(type: 'income' | 'expense'): void {
    if (!this.openSession) return;
    const types = this.movementTypes.filter(item => item.operation === (type === 'income' ? 'I' : 'E'));
    const dialogRef = this._matDialog.open(CashMovementDialogComponent, {
      autoFocus: false,
      data: { sessionId: this.openSession.id, movementTypes: types, type },
      width: '92vw',
      maxWidth: '520px',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(payload => {
      if (!payload) return;
      this.isLoading = true;
      this._generalApi.add('CashMovement', {
        cashSessionId: payload.cashSessionId,
        movementTypeId: payload.movementTypeId,
        amount: payload.amount,
        description: payload.description
      }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this._toast.success('Movimiento registrado correctamente.');
            this.refreshSessionDetails();
          } else {
            this._toast.error(resp.error?.detail ?? 'No se pudo registrar el movimiento.');
            this.isLoading = false;
          }
        },
        error: () => this.finishLoad('Error inesperado al registrar el movimiento.')
      });
    });
  }

  deleteMovement(id: number): void {
    this.isLoading = true;
    this._generalApi.delete('CashMovement', id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this._toast.success('Movimiento eliminado correctamente.');
          this.refreshSessionDetails();
        } else {
          this._toast.error(resp.error?.detail ?? 'No se pudo eliminar el movimiento.');
          this.isLoading = false;
        }
      },
      error: () => this.finishLoad('Error inesperado al eliminar el movimiento.')
    });
  }

  onMovementRowAction(event: { action: string; row: any }): void {
    if (event.action === 'delete') {
      this.deleteMovement(event.row.id);
    }
  }

  closeCashDialog(): void {
    if (!this.openSession) return;
    const dialogRef = this._matDialog.open(CashCloseDialogComponent, {
      autoFocus: false,
      data: { expectedAmount: this.summary.expectedAmount },
      width: '92vw',
      maxWidth: '520px',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(payload => {
      if (!payload) return;
      this.isLoading = true;
      this._generalApi.closeSession(this.openSession.id, { closingAmount: payload.closingAmount })
        .pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: (resp: ApiResponse<any>) => {
            if (resp.success) {
              this._toast.success('Caja cerrada correctamente.');
              this.loadSessions();
            } else {
              this._toast.error(resp.error?.detail ?? 'No se pudo cerrar la caja.');
              this.isLoading = false;
            }
          },
          error: () => this.finishLoad('Error inesperado al cerrar la caja.')
        });
    });
  }

  private finishLoad(message: string): void {
    this.isLoading = false;
    this._toast.error(message);
  }
}