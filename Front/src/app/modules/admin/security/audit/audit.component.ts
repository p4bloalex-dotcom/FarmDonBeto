import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';
import { AuditdetailDialogComponent } from './component/auditdetail-dialog/auditdetail-dialog.component';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { ActionType } from 'app/core/Models/action.type';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { TableComponent } from '@fuse/components/table/table.component';

@Component({
  selector: 'app-audit',
  imports: [
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSortModule,
    TableComponent
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {

      searchInputControl: UntypedFormControl = new UntypedFormControl();
      pagedData: Array<any>[] = [];
      filteredData: any[] = [];
      private _unsubscribeAll = new Subject<void>()
      pageSize = 10;
      pageIndex = 0;
      totalItems = 0;
      service:string = 'Audit';
      filters: any = { tableName: '', action: '', userId: '', branchId: '', recordId: '', startDate: '', endDate: '', search: '' };
  
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
        // this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
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
    
        this._generalApi.getPagedFiltered(this.service,this.pageIndex + 1, this.pageSize, this.filters)
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
        const dialogRef =  this._matDialog.open(AuditdetailDialogComponent, {
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
                item.idUser === payload.idData ? { ...item, ...payload } : item
              );
              break;
            case 3: // Cambiar estado ---OJO--
              this.filteredData = this.filteredData.map(item =>
                item.idUser === payload.idData ? { ...item, status: payload.status } : item
              );
              break;
            case 4: // Eliminar
              this.filteredData = this.filteredData.filter(item =>
                item.idUser !== payload.idData
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
      const endpoints = ['User',];
      this._generalApi.comboList(endpoints)
        .subscribe({
          next: ([data1]) => {
            data1.forEach(data =>
              this.dictData1.set(data.idUser, data.name)
            )
            // data2.forEach(data => {
            //   this.dictData2.set(data.idRole, data.roleName)
            // });
            this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
          },
          error: err => {
            this._toast.error(err.message || 'Error inesperado. Intenta más tarde.');
          }
      });
    }

    applyFilters(): void {
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    }

    clearFilters(): void {
      this.filters = { tableName: '', action: '', userId: '', branchId: '', recordId: '', startDate: '', endDate: '', search: '' };
      this.applyFilters();
    }

    exportCsv(): void {
      this._generalApi.exportAudit(this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
        next: response => {
          const blob = response.body;
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'auditoria.csv';
          link.click();
          URL.revokeObjectURL(url);
        },
        error: () => this._toast.error('No se pudo exportar la auditoria.')
      });
    }
  
    updateListPaged(){
      this.pagedData = this.filteredData.map(req => {
        const name1 = this.dictData1.get(req.idUser) ?? '-'; //--OJO
        // const name2 = this.dictData2.get(req.idRole) ?? '-'; //--OJO
        return{
          ...req,
          name1: name1,
          // name2: name2
        }
      });
    }
  
      //-------METODOS PARA ACCIONES----------//
    
      //-----DATOS DE NECESARIOS PARA LA TABLA-------//
  
    columns: TableColumn[] = 
    [
      // { field: 'id',   header: '#',       width: '50px'    },
      { field: 'name1', header: 'Nombre personal',  width: '2fr'     },
      { field: 'entidad',   header: 'Tabla',  width: '1fr', hideAt: 'lg' },
      { field: 'accion',   header: 'Accion',  width: '1fr', hideAt: 'lg' },
      { field: 'permiso',   header: 'Permiso',  width: '1fr', hideAt: 'lg' },
      { field: 'fecha',   header: 'Fecha',  width: '175px', hideAt: 'lg' },
    ];
    
    actions: TableAction[] = 
    [
      // { action: 'edit', label: 'Editar', icon: 'feather:edit' },
      // { action: 'delete', label: 'Eliminar', icon: 'delete_forever' },
      // { action: 'resetPass', label: 'Resetear contraseña', icon: 'mat_solid:password' }
      { action: 'view', label: 'Editar', icon: 'feather:eye' },
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
      if (event.action === 'resetPass') {
        this.openDialog(event.row, ActionType.ResetPass);
      }
      if (event.action === 'view') {
        this.openDialog(event.row, ActionType.View);
      }
    }
      //-----DATOS DE NECESARIOS PARA LA TABLA-------//

}
