import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-fixed-asset-history-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, TableComponent],
  templateUrl: './fixed-asset-history-dialog.component.html'
})
export class FixedAssetHistoryDialogComponent implements OnInit, OnDestroy {
  asset: any = {};
  rows: any[] = [];
  isLoading = false;

  columns: TableColumn[] = [
    { field: 'createdAtLabel', header: 'Fecha', width: '150px' },
    { field: 'actionLabel', header: 'Accion', width: '120px' },
    { field: 'branchFromName', header: 'Origen', width: '1fr' },
    { field: 'branchToName', header: 'Destino', width: '1fr' },
    { field: 'responsibleToLabel', header: 'Responsable', width: '1fr' },
    { field: 'reason', header: 'Motivo', width: '1.6fr' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private _dialogRef: MatDialogRef<FixedAssetHistoryDialogComponent>,
    private _api: GeneralApiService,
    private _toast: HotToastService
  ) {
    this.asset = data?.asset ?? {};
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  close(): void {
    this._dialogRef.close();
  }

  loadHistory(): void {
    const id = Number(this.asset?.id);
    if (!id) return;
    this.isLoading = true;
    this._api.getAction('FixedAsset', id, 'history').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        this.isLoading = false;
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo cargar historial del activo.');
        this.rows = (resp.data ?? []).map((item: any) => this.decorateHistory(item));
      },
      error: () => {
        this.isLoading = false;
        this._toast.error('Error inesperado al cargar historial del activo.');
      }
    });
  }

  private decorateHistory(item: any): any {
    return {
      ...item,
      createdAtLabel: String(item.createdAt ?? '').slice(0, 16).replace('T', ' '),
      actionLabel: item.action === 'RETIRED' ? 'Baja' : item.action === 'TRANSFERRED' ? 'Traslado' : item.action === 'ASSIGNMENT' ? 'Asignacion' : item.action,
      branchFromName: item.branchFromName ?? 'Sin origen',
      branchToName: item.branchToName ?? 'Sin destino',
      responsibleToLabel: item.responsibleTo ?? item.responsibleFrom ?? 'Sin responsable'
    };
  }
}
