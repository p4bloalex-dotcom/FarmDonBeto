import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { DataPagination } from '@fuse/services/config/config.DataPagination';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { RolemenuDialogComponent } from './components/rolemenu-dialog/rolemenu-dialog.component';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-role-menu',
  imports: [
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    TableComponent,
    MatSelectModule,
  ],
  templateUrl: './role-menu.component.html',
  styleUrl: './role-menu.component.scss'
})
export class RoleMenuComponent {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  axData1: Array<any>[] = [];
  axData2: Array<any>[] = [];
  pagedData: Array<any>[] = [];
  isLoading: boolean = false;
  pagination: DataPagination;
  filteredData: any[] = [];
  private _unsubscribeAll = new Subject<void>()
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  dataForm: UntypedFormGroup;

  private dictData1 = new Map<number, string>();
  private dictData2 = new Map<number, string>();


  //-------MENTODOS AUTOMATICOS----------//
  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
    private _formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.dataForm = this._formBuilder.group({
      idRole: ['', [Validators.required],],
    });

    this.getList();
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
          item.name1?.toString().toLowerCase().includes(text) /*OJO*/ ||
          item.name2?.toString().toLowerCase().includes(text)
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
    const idData = this.dataForm.value.idRole;
    this._generalApi.getPagedQuery("MenuRol", this.pageIndex + 1, this.pageSize, idData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.filteredData = resp.data.data;
            this.totalItems = resp.data.meta.totalItemCount;
            //this.pagedData = this.filteredData;
            this.updateListPaged();
          } else {
            this._toast.error(resp.error.detail);
          }
        },
        error: (error) => {
          this._toast.error('Error inesperado. Intenta más tarde.');
        }
      });
  }

  //-----METODOS DE PAGINACION--------//

  //-------METODOS PARA ACCIONES----------//

  openDialog(row: any, action: number): void {
    const idData = this.dataForm.value.idRole;
    const dialogRef = this._matDialog.open(RolemenuDialogComponent, {
      autoFocus: false,
      data: { row, action, data1: this.axData1, data2: this.dictData2, idData: idData },
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

      switch (idAction) {
        case 1: // Crear
          this.filteredData = [payload, ...this.filteredData];
          break;
        case 2: // Editar ---OJO--
          this.filteredData = this.filteredData.map(item =>
            item.idRoleMenu === payload.idData ? { ...item, ...payload } : item
          );
          break;
        case 3: // Cambiar estado ---OJO--
          this.filteredData = this.filteredData.map(item =>
            item.idRoleMenu === payload.idData ? { ...item, status: payload.status } : item
          );
          break;
        case 4: // Eliminar
          this.filteredData = this.filteredData.filter(item =>
            item.idRoleMenu !== payload.idData
          );
          break;
        default:
      }
      this.updateListPaged()
      this._toast.success('Operación exitosa');
    });
  }


  getList(): void {
    const endpoints = ['Role', 'Menu'];
    this._generalApi.comboList(endpoints)
      .subscribe({
        next: ([data1, data2]) => {
          this.axData1 = data1
          data1.forEach(data =>
            this.dictData1.set(data.id, data.name)
          )
          data2.forEach(data => {
            const nameMenuComplete = (data.menu_father != null ? data.menu_father.name + ' > ' : '') + data.name;
            this.dictData2.set(data.id, nameMenuComplete);
          });
        },
        error: err => {
          this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
        }
      });
  }


  find() {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
  }

  updateListPaged() {
    this.pagedData = this.filteredData.map(req => {
      const name1 = this.dictData1.get(req.idRole) ?? '-'; //--OJO
      const name2 = this.dictData2.get(req.idMenu) ?? '-'; //--OJO
      return {
        ...req,
        name1: name1,
        name2: name2
      }
    });
    this.filteredData = this.pagedData;
  }

  //-------METODOS PARA ACCIONES----------//

  //-----DATOS DE NECESARIOS PARA LA TABLA-------//
  columns: TableColumn[] =
    [
      { field: 'idRoleMenu', header: '#', width: '50px' },
      { field: 'name1', header: 'Role', width: '3fr' },
      { field: 'name2', header: 'Menu', width: '3fr' },
      { field: 'status', header: 'Estado', width: '120px', hideAt: 'lg' },
    ];

  actions: TableAction[] =
    [
      { action: 'edit', label: 'Editar', icon: 'feather:edit' },
      { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
    ];

  handleRowAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.openDialog(event.row, 2);
    }
    if (event.action === 'changeEstatus') {
      this.openDialog(event.row, 3);
    }
    if (event.action === 'delete') {
      this.openDialog(event.row, 4);
    }
  }
  //-----DATOS DE NECESARIOS PARA LA TABLA-------//


  trackByFn(index: number, item: any): any {
    return item.id || index;
  }


}
