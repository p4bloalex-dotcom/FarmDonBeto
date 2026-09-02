import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
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
import { CellFormatPipe } from '@fuse/pipes/cellFormatPipe.pipe';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { DataPagination } from '@fuse/services/config/config.DataPagination';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'app-inventory-history',
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
        MatIconModule,
        MatPaginatorModule,
        CellFormatPipe
    ],
    templateUrl: './inventory-history.component.html',
    styleUrl: './inventory-history.component.scss'
})
export class InventoryHistoryComponent {

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
       pageSizeOptions: number[] = [5, 10, 20, 40];
      
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
      
          this._generalApi.getPaged("InventoryHistory",this.pageIndex + 1, this.pageSize)
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
      // { field: 'id_movement',   header: '#',       width: '50px'    },
      { field: 'notes', header: 'Descripción', width: '1.5fr' },
      { field: 'itemName', header: 'Nombre ítem', width: '1fr' },
      { field: 'quantity', header: 'Cantidad', width: '90px', hideAt: 'lg' },
      { field: 'holderName', header: 'Solicitante', width: '1fr', hideAt: 'lg' },
      { field: 'created_at', header: 'Fecha de registro', width: '170px', hideAt: 'lg' },
      { field: 'userName', header: 'Generado por', width: '130px', hideAt: 'lg' },

    ];

      
  getGridTemplate(): string {
    return this.columns.map(col => col.width ?? '1fr').join(' ');
  }

    isHidden(col?: TableColumn): boolean {
    if (!col?.hideAt) return false;
    const bpMap = { sm: 640, md: 768, lg: 1024 };
    return window.innerWidth < (bpMap[col.hideAt] ?? 0);
  }

    
  trackByFn(index: number, item: any) {
    return item?.id ?? index;
  }
    

}
