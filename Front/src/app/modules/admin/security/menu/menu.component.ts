import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DataPagination } from '@fuse/services/config/config.DataPagination';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { MenuDialogComponent } from './components/menu-dialog/menu-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-menu',
  imports: [
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    TableComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  aData: Array<any>[] = [];
  pagedData: Array<any>[] = [];
  isLoading: boolean = false;
  pagination: DataPagination;
  filteredData: any[] = [];
  private _unsubscribeAll = new Subject<void>()
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;


  //-------MENTODOS AUTOMATICOS----------//
  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getList();
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
          item.name.toLowerCase().includes(text) ||
          item.path.toLowerCase().includes(text) ||
          item.icon.toLowerCase().includes(text)
        );
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  //-------MENTODOS AUTOMATICOS----------//

  //-----METODOS DE PAGINACION--------//
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this._generalApi.getPaged("Menu", this.pageIndex + 1, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.filteredData = resp.data.data;
            this.totalItems = resp.data.meta.totalItemCount;
            this.pagedData = this.filteredData;
          }
        },
      });
  }

  //-----METODOS DE PAGINACION--------//

  //-------METODOS PARA ACCIONES----------//

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(MenuDialogComponent, {
      autoFocus: false,
      data: { row, action, data1: this.aData.filter((x: any) => x.id_menu_father === null) },
      width: '80vw',
      maxWidth: '1100px',
      height: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (!updated) {
        return;
      }
      this.pagedData = this.filteredData.map((item: any) =>
        item.id === updated.idData
          ? { ...item, ...updated }
          : item
      );
      this._toast.success('Operación exitosa');
    });
  }


  getList(): void {
    this._generalApi.getList("Menu").subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.aData = response.data;
        } else {
          this._toast.error(response.error.detail);
        }
      },
      error: (error) => {
        this._toast.error('Error inesperado. Intenta más tarde.');
      }
    });
  }
  //-------METODOS PARA ACCIONES----------//

  //-----DATOS DE NECESARIOS PARA LA TABLA-------//
  columns: TableColumn[] =
    [
      { field: 'id', header: '#', width: '50px' },
      { field: 'name', header: 'Nombre', width: '3fr' },
      { field: 'icon', header: 'Icono', width: '1fr', hideAt: 'lg' },
      { field: 'path', header: 'Ruta', width: '3fr', hideAt: 'sm' },
      { field: 'status', header: 'Estado', width: '120px', hideAt: 'lg' },
      { field: 'order', header: 'Orden', width: '1fr', hideAt: 'lg' }
    ];

  actions: TableAction[] =
    [
      { action: 'edit', label: 'Editar', icon: 'feather:edit' },
      { action: 'changeEstatus', label: 'Cambiar estado', icon: 'mat_solid:change_circle' }
    ];

  handleRowAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.openDialog(event.row, 2);
    }
    if (event.action === 'changeEstatus') {
      this.openDialog(event.row, 3);
    }
  }
  //-----DATOS DE NECESARIOS PARA LA TABLA-------//

}
