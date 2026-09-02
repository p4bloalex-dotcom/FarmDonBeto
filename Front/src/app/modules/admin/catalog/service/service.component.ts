import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { ServiceDialogComponent } from './components/service-dialog/service-dialog.component';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { ActionType } from 'app/core/Models/action.type';

@Component({
  selector: 'app-service',
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
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss'
})
export class ServiceComponent implements OnInit, OnDestroy {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  private _unsubscribeAll = new Subject<void>();
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service: string = 'Service';

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
      .subscribe(searchText => {
        const text = searchText?.toLowerCase() || '';
        this.pagedData = this.filteredData.filter((item: any) =>
          item.name?.toLowerCase().includes(text) ||
          item.description?.toLowerCase().includes(text)
        );
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            // Map the primary key to item.id uniformly to simplify table column rendering
            this.filteredData = (resp.data?.data || []).map((item: any) => ({
              ...item,
              id: item.id ?? item.idService ?? item.id_service
            }));
            this.totalItems = resp.data?.meta?.totalItemCount || 0;
            this.pagedData = this.filteredData;
          } else {
            this._toast.error(resp.error?.detail || 'Error al obtener los datos');
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
        }
      });
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(ServiceDialogComponent, {
      autoFocus: false,
      data: { row, action },
      width: '80vw',
      maxWidth: '1100px',
      height: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (!updated) {
        return;
      }
      const { idAction, ...payload } = updated;
      
      // Ensure the payload has mapped id field
      const mappedPayload = {
        ...payload,
        id: payload.id ?? payload.idService ?? payload.id_service ?? payload.idData
      };

      switch (idAction) {
        case ActionType.Create: // Crear
          this.filteredData = [mappedPayload, ...this.filteredData];
          break;
        case ActionType.Edit: // Editar
          this.filteredData = this.filteredData.map(item =>
            (item.id === payload.idData || item.idService === payload.idData || item.id_service === payload.idData) 
              ? { ...item, ...mappedPayload } 
              : item
          );
          break;
        case ActionType.ChangeStatus: // Cambiar estado
          this.filteredData = this.filteredData.map(item =>
            (item.id === payload.idData || item.idService === payload.idData || item.id_service === payload.idData) 
              ? { ...item, status: payload.status } 
              : item
          );
          break;
        case ActionType.Delete: // Eliminar
          this.filteredData = this.filteredData.filter(item =>
            item.id !== payload.idData && item.idService !== payload.idData && item.id_service !== payload.idData
          );
          break;
        default:
          console.warn(`Acción desconocida: ${idAction}`);
      }
      this.pagedData = this.filteredData;
      this._toast.success('Operación exitosa');
    });
  }

  columns: TableColumn[] = [
    { field: 'id', header: '#', width: '50px' },
    { field: 'name', header: 'Nombre del servicio', width: '1.5fr' },
    { field: 'description', header: 'Descripción', width: '2fr', hideAt: 'md' },
    { field: 'duration_minutes', header: 'Duración', width: '120px' },
    { field: 'gap_service', header: 'Brecha de descanso', width: '150px' },
    { field: 'price', header: 'Precio', width: '100px' },
    { field: 'status', header: 'Estado', width: '120px', hideAt: 'lg' },
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
