import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { BusinessHourDialogComponent } from './components/business-hour-dialog/business-hour-dialog.component';

@Component({
  selector: 'app-business-hour',
  imports: [
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSortModule,
    TableComponent
  ],
  templateUrl: './business-hour.component.html',
  styleUrl: './business-hour.component.scss'
})
export class BusinessHourComponent implements OnInit, OnDestroy {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  private _unsubscribeAll = new Subject<void>();
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service: string = 'BusinessHour';

  daysWeek = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miercoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sabado' },
  ];

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);

    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchText => this.applyFilter(searchText));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  applyFilter(searchText: string): void {
    const text = searchText?.toLowerCase() || '';
    this.pagedData = this.filteredData.filter((item: any) =>
      item.dayName?.toLowerCase().includes(text) ||
      item.displayOpenTime?.toLowerCase().includes(text) ||
      item.displayCloseTime?.toLowerCase().includes(text) ||
      item.statusLabel?.toLowerCase().includes(text)
    );
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.filteredData = (resp.data?.data || []).map((item: any) => this.mapBusinessHour(item));
            this.totalItems = resp.data?.meta?.totalItemCount || 0;
            this.pagedData = this.filteredData;
          } else {
            this._toast.error(resp.error?.detail || 'Error al obtener los datos');
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta mas tarde.');
        }
      });
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(BusinessHourDialogComponent, {
      autoFocus: false,
      data: { row, action, data1: this.daysWeek },
      width: '92vw',
      maxWidth: '760px',
      height: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (!updated) {
        return;
      }

      const { idAction, ...payload } = updated;
      const mappedPayload = this.mapBusinessHour(payload);

      switch (idAction) {
        case ActionType.Create:
          this.filteredData = [mappedPayload, ...this.filteredData];
          break;
        case ActionType.Edit:
          this.filteredData = this.filteredData.map(item =>
            item.id === payload.idData ? { ...item, ...mappedPayload } : item
          );
          break;
        case ActionType.ChangeStatus:
          this.filteredData = this.filteredData.map(item =>
            item.id === payload.idData ? { ...item, status: payload.status, statusLabel: this.getStatusLabel(payload.status) } : item
          );
          break;
        case ActionType.Delete:
          this.filteredData = this.filteredData.filter(item => item.id !== payload.idData);
          break;
        default:
          console.warn(`Accion desconocida: ${idAction}`);
      }

      this.pagedData = this.filteredData;
      this._toast.success('Operacion exitosa');
    });
  }

  mapBusinessHour(item: any): any {
    const dayWeek = Number(item.day_week ?? item.dayWeek ?? 0);
    const isClosed = item.is_closed ?? item.isClosed ?? false;

    return {
      ...item,
      id: item.id,
      day_week: dayWeek,
      dayName: this.getDayName(dayWeek),
      open_time: item.open_time,
      close_time: item.close_time,
      displayOpenTime: isClosed ? 'Cerrado' : this.formatTime(item.open_time),
      displayCloseTime: isClosed ? 'Cerrado' : this.formatTime(item.close_time),
      is_closed: isClosed,
      isClosedLabel: isClosed ? 'Si' : 'No',
      statusLabel: this.getStatusLabel(item.status),
    };
  }

  getDayName(dayWeek: number): string {
    return this.daysWeek.find(day => day.id === dayWeek)?.name || '-';
  }

  getStatusLabel(status: string): string {
    return status === 'E' ? 'Activo' : status === 'D' ? 'Desactivado' : '-';
  }

  formatTime(value: any): string {
    if (!value) return '-';
    const parts = String(value).split(':');
    return parts.length >= 2 ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : String(value);
  }

  columns: TableColumn[] = [
    { field: 'id', header: '#', width: '50px', hideAt: 'sm' },
    { field: 'dayName', header: 'Dia', width: '1fr' },
    { field: 'displayOpenTime', header: 'Apertura', width: '120px' },
    { field: 'displayCloseTime', header: 'Cierre', width: '120px' },
    { field: 'isClosedLabel', header: 'Cierra', width: '100px' },
    { field: 'status', header: 'Estado', width: '120px' },
  ];

  actions: TableAction[] = [
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' },
    { action: 'changeEstatus', label: 'Cambiar estado', icon: 'mat_solid:change_circle' }
  ];

  handleRowAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.openDialog(event.row, ActionType.Edit);
    }
    if (event.action === 'changeEstatus') {
      this.openDialog(event.row, ActionType.ChangeStatus);
    }
    if (event.action === 'delete') {
      this.openDialog(event.row, ActionType.Delete);
    }
  }
}
