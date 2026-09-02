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
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { DataPagination } from '@fuse/services/config/config.DataPagination';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { PerdocrequeDialogComponent } from './components/perdocreque-dialog/perdocreque-dialog.component';

@Component({
    selector: 'app-personaldo-reque',
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
    templateUrl: './personaldo-reque.component.html',
    styleUrl: './personaldo-reque.component.scss'
})
export class PersonaldoRequeComponent {

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagedData: Array<any>[] = [];
    filteredData: any[] = [];
    private _unsubscribeAll = new Subject<void>()
    pageSize = 10;
    pageIndex = 0;
    totalItems = 0;
    service:string = 'PersonalDocumentsRequeriment';

    private dictData1 = new Map<number,string>();
    private dictData2 = new Map<number,string>();

    //-------MENTODOS AUTOMATICOS----------//
    constructor(
      private _generalApi: GeneralApiService,
      private _toast: HotToastService,
      private _matDialog: MatDialog,
    ){}
  
    ngOnInit(){
      this.getList()
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
  
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
      this.pageSize  = event.pageSize;
  
      this._generalApi.getPaged(this.service,this.pageIndex + 1, this.pageSize)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (resp:ApiResponse<any>) => {
            if (resp.success) {
              this.filteredData    = resp.data.data;
              this.totalItems      = resp.data.meta.totalItemCount;
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
      const dialogRef =  this._matDialog.open(PerdocrequeDialogComponent, {
        autoFocus: false,
        data: { row, action, data1: this.dictData1, data2: this.dictData2},
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
              item.idPersonalDocuReq === payload.idData ? { ...item, ...payload } : item
            );
            break;
          case 3: // Cambiar estado ---OJO--
            this.filteredData = this.filteredData.map(item =>
              item.idPersonalDocuReq === payload.idData ? { ...item, status: payload.status } : item
            );
            break;
          case 4: // Eliminar
            this.filteredData = this.filteredData.filter(item =>
              item.idPersonalDocuReq !== payload.idData
            );
            break;
          default:
            console.warn(`Acción desconocida: ${idAction}`);
        }
        this.updateListPaged()
        this._toast.success('Operación exitosa');
      });
    }
  
    
  getList(): void {
    const endpoints = ['TypePersonal', 'TypeDocument'];
    this._generalApi.comboList(endpoints)
      .subscribe({
        next: ([data1, data2]) => {
          data1.forEach(data =>
            this.dictData1.set(data.idTypePersonal, data.name)
          )
          data2.forEach(data => {
            this.dictData2.set(data.idTypeDocument, data.name)
          });
        },
        error: err => {
          this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
        }
    });
  }

  updateListPaged(){
    this.pagedData = this.filteredData.map(req => {
      const name1 = this.dictData1.get(req.idTypePersonal) ?? '-'; //--OJO
      const name2 = this.dictData2.get(req.idTypeDocument) ?? '-'; //--OJO
      return{
        ...req,
        typePersonalName: name1,
        typeDocument: name2
      }
    });
  }

    //-------METODOS PARA ACCIONES----------//
  
    //-----DATOS DE NECESARIOS PARA LA TABLA-------//

  columns: TableColumn[] = 
  [
    { field: 'idPersonalDocuReq',   header: '#',       width: '50px'    },
    { field: 'typePersonalName', header: 'Tipo de personal',  width: '2fr'     },
    { field: 'typeDocument',   header: 'Tipo de documento',  width: '2fr', hideAt: 'lg' },
    { field: 'isMandatory',   header: 'Es obligatorio',  width: '130px', hideAt: 'lg' },
    { field: 'status',   header: 'Estado',  width: '130px', hideAt: 'lg' },
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
