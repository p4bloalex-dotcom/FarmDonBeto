import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { LoanDialogComponent } from './loan-dialog/loan-dialog.component';
import { ActionType } from 'app/core/Models/action.type';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { TableComponent } from '@fuse/components/table/table.component';

@Component({
    selector: 'app-loan',
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
    templateUrl: './loan.component.html',
    styleUrl: './loan.component.scss'
})
export class LoanComponent {

      searchInputControl: UntypedFormControl = new UntypedFormControl();
      pagedData: Array<any>[] = [];
      filteredData: any[] = [];
      private _unsubscribeAll = new Subject<void>()
      pageSize = 10;
      pageIndex = 0;
      totalItems = 0;
      service: string = 'Loan';
    
      private dictData1 = new Map<number, string>();
      aData1: any;
      private dictData2 = new Map<number, string>();
      aData2: any;
    
      //-------MENTODOS AUTOMATICOS----------//
      constructor(
        private _generalApi: GeneralApiService,
        private _toast: HotToastService,
        private _matDialog: MatDialog,
      ) { }
    
      ngOnInit() {
        this.getList()
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
    
      applyFilter(searchText: string): void {
        const text = searchText?.toLowerCase() || '';
        this.pagedData = this.filteredData.filter(item =>
          Object.values(item).some(val => String(val).toLowerCase().includes(text))
        );
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
                // this.pagedData = this.filteredData;
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
        const dialogRef = this._matDialog.open(LoanDialogComponent, {
          autoFocus: false,
          data: { row, action, data1: this.aData1, data2: this.aData2 },
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
                item.batchId === payload.idData ? { ...item, ...payload } : item
              );
              break;
            case 3: // Cambiar estado ---OJO--
              this.filteredData = this.filteredData.map(item =>
                item.batchId === payload.idData ? { ...item, status: payload.status } : item
              );
              break;
            case 4: // Eliminar
              this.filteredData = this.filteredData.filter(item =>
                item.batchId !== payload.idData
              );
              break;
            case ActionType.Reverse:
              this.filteredData = this.filteredData.filter(item =>
                item.batchId !== payload.idData
              );
              break;
             case ActionType.Receive:
              this.filteredData = this.filteredData.filter(item =>
                item.batchId !== payload.idData
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
        const endpoints = ['Personal', 'Loan/itemLoan'];
        this._generalApi.comboList(endpoints)
          .subscribe({
            next: ([data1, data2]) => {
              this.aData1 = data1;
              this.aData2 = data2;
              data1.forEach(data =>
                this.dictData1.set(data.idPersonal, data.name)
              )
              data2.forEach(data => {
                this.dictData2.set(data.id_item, data.name)
              });
            },
            error: err => {
              this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
            }
          });
      }
    
      updateListPaged() {
        this.pagedData = this.filteredData.map(req => {
          const name1 = this.dictData1.get(req.idPersonal) ?? '-'; //--OJO
          const name2 = this.dictData2.get(req.id_item) ?? '-'; //--OJO
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
          //{ field: 'batchId', header: '#', width: '50px' },
          { field: 'nameHolder', header: 'Nombre', width: '1fr'},
          { field: 'holderType', header: 'Tipo', width: '1fr'},
          { field: 'nameItem', header: 'Producto', width: '1fr' },
          { field: 'quantity', header: 'Cantidad', width: '1fr', hideAt: 'lg' },
          { field: 'createdAt', header: 'Fecha de registro', width: '1fr', hideAt: 'lg' },
          { field: 'returnDate', header: 'Devolucion', width: '1fr', hideAt: 'lg' },
          // { field: 'status', header: 'Estado', width: '130px', hideAt: 'lg' },
        ];
    
      actions: TableAction[] =
        [
          // { action: 'view', label: 'Editar', icon: 'feather:eye' },
          { action: 'reverse', label: 'Reversar', icon: 'mat_solid:assignment_return' },
          { action: 'receive', label: 'Recibir Prestamo', icon: 'save_alt' },
          // { action: 'delete', label: 'Eliminar', icon: 'delete_forever' },
          // { action: 'changeEstatus', label: 'Cancelar donacion', icon: 'mat_solid:change_circle' },
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
        if (event.action === 'view') {
          this.openDialog(event.row, ActionType.View);
        }
        if (event.action === 'reverse') {
          this.openDialog(event.row, ActionType.Reverse);
        }
        if (event.action === 'receive') {
          this.openDialog(event.row, ActionType.Receive);
        }
      }
      //-----DATOS DE NECESARIOS PARA LA TABLA-------//

      
}
