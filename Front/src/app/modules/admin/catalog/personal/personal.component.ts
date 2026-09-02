import { Component } from '@angular/core';
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
import { PersonalDialogComponent } from './components/personal-dialog/personal-dialog.component';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { UploadfileDialogComponent } from './components/uploadfile-dialog/uploadfile-dialog.component';
import { ActionType } from 'app/core/Models/action.type';

@Component({
  selector: 'app-personal',
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
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.scss'
})
export class PersonalComponent {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  pagedData: Array<any>[] = [];
  filteredData: any[] = [];
  private _unsubscribeAll = new Subject<void>()
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service: string = 'Personal';

  private dictData1 = new Map<number, string>();
  // private dictData2 = new Map<number, string>();

  //-------MENTODOS AUTOMATICOS----------//
  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getList()

    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchText => {
        // const text = searchText?.toLowerCase() || '';
        // this.pagedData = this.filteredData.filter((item: any) =>
        //   item.typePersonalName.toLowerCase().includes(text) ||
        //   item.typeDocument.toLowerCase().includes(text)
        // );
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

    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.filteredData = resp.data.data;
            this.totalItems = resp.data.meta.totalItemCount;
            this.pagedData = this.filteredData;
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
    const dialogRef = this._matDialog.open(PersonalDialogComponent, {
      autoFocus: false,
      data: { row, action, data1: this.dictData1 },
      width: '85vw',
      maxWidth: '1200px',
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
            item.id === payload.idData ? { ...item, ...payload } : item
          );
          break;
        case 3: // Cambiar estado ---OJO--
          this.filteredData = this.filteredData.map(item =>
            item.id === payload.idData ? { ...item, status: payload.status } : item
          );
          break;
        case 4: // Eliminar
          this.filteredData = this.filteredData.filter(item =>
            item.id !== payload.idData
          );
          break;
        default:
          console.warn(`Acción desconocida: ${idAction}`);
      }
      this.pagedData = this.filteredData;
      //this.updateListPaged()
      this._toast.success('Operación exitosa');
    });
  }


  getList(): void {
    const endpoints = ['Company'];
    this._generalApi.comboList(endpoints)
      .subscribe({
        next: ([data1]) => {
          data1.forEach(data =>
            this.dictData1.set(data.id, data.name)
          )
          this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        },
        error: err => {
          this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
        }
      });
  }

  updateListPaged() {
    // this.pagedData = this.filteredData.map(req => {
    //   const name1 = this.dictData1.get(req.idTypePersonal) ?? '-'; //--OJO
    //   const name2 = this.dictData2.get(req.idPositionPersonal) ?? '-'; //--OJO
    //   return {
    //     ...req,
    //     typePersonalName: name1,
    //     typeDocument: name2
    //   }
    // });
  }

  uploadDoc(row: any) {
    const dialogRef = this._matDialog.open(UploadfileDialogComponent, {
      autoFocus: false,
      data: { row },
      width: '60vw',
      maxWidth: '1000px',
      height: 'auto',
      disableClose: true,
    });
  }

  //-------METODOS PARA ACCIONES----------//

  //-----DATOS DE NECESARIOS PARA LA TABLA-------//

  columns: TableColumn[] =
    [
      { field: 'id', header: '#', width: '50px' },
      { field: 'first_name', header: 'Primero nombre', width: '1fr', hideAt: 'lg' },
      { field: 'last_name', header: 'Primer apellido', width: '1fr', hideAt: 'lg' },
      { field: 'status', header: 'Estado', width: '130px', hideAt: 'lg' },
    ];

  actions: TableAction[] =
    [
      { action: 'edit', label: 'Editar', icon: 'feather:edit' },
      { action: 'delete', label: 'Eliminar', icon: 'delete_forever' },
      { action: 'changeEstatus', label: 'Cambiar estado', icon: 'mat_solid:change_circle' },
      // { action: 'uploadDoc', label: 'Subir papeleria', icon: 'heroicons_solid:document-arrow-up' }
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
    if (event.action === 'uploadDoc') {
      this.uploadDoc(event.row);
    }
  }
  //-----DATOS DE NECESARIOS PARA LA TABLA-------//


}
