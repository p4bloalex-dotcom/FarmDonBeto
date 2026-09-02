import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
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
import { PositionpersonalDialogComponent } from './components/positionpersonal-dialog/positionpersonal-dialog.component';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';

@Component({
    selector: 'app-position-personal',
    imports: [
        MatProgressBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatPaginatorModule,
        MatSortModule,
        TableComponent
    ],
    templateUrl: './position-personal.component.html',
    styleUrl: './position-personal.component.scss'
})
export class PositionPersonalComponent {

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
  ){}

  ngOnInit(){
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
          item.name.toLowerCase().includes(text)
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
    this.pageSize  = event.pageSize;

    this._generalApi.getPaged("PositionPersonal",this.pageIndex + 1, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp:ApiResponse<any>) => {
          if (resp.success) {
            this.filteredData    = resp.data.data;
            this.totalItems      = resp.data.meta.totalItemCount;
            this.pagedData = this.filteredData;
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
    const dialogRef =  this._matDialog.open(PositionpersonalDialogComponent, {
      autoFocus: false,
      data: { row, action},
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
            item.idPositionPersonal === payload.idData ? { ...item, ...payload } : item
          );
          break;
        case 3: // Cambiar estado ---OJO--
          this.filteredData = this.filteredData.map(item =>
            item.idPositionPersonal === payload.idData ? { ...item, status: payload.status } : item
          );
          break;
        case 4: // Eliminar
          this.filteredData = this.filteredData.filter(item =>
            item.idPositionPersonal !== payload.idData
          );
          break;
        default:
          console.warn(`Acción desconocida: ${idAction}`);
      }
      this.pagedData = this.filteredData;
      this._toast.success('Operación exitosa');
    });
  }

  
  // getList(): void {
  //   this._generalApi.getList("Role").subscribe({
  //       next: (response:ApiResponse<any>) => {
  //           if (response.success) {
  //             this.aData = response.data;
  //           } else {
  //             this._toast.error(response.error.detail);
  //           }
  //       },
  //       error: (error) => {
  //           this._toast.error('Error inesperado. Intenta más tarde.');
  //       }
  //   });
  // }
  //-------METODOS PARA ACCIONES----------//

  //-----DATOS DE NECESARIOS PARA LA TABLA-------//
  columns: TableColumn[] = 
  [
    { field: 'idPositionPersonal',   header: '#',       width: '50px'    },
    { field: 'name', header: 'Nombre',  width: '3fr'     },
    { field: 'status',   header: 'Estado',  width: '120px', hideAt: 'lg' },
    { field: 'hasShift',   header: 'Turno',  width: '130px', hideAt: 'lg' },
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


}
