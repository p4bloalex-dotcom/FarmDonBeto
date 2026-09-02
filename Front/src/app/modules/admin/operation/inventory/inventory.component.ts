import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { InventoryCreateComponent } from './components/inventory-create/inventory-create.component';
import { MatSelectModule } from '@angular/material/select';
import { InventoryUpdateComponent } from './components/inventory-update/inventory-update.component';
import { UpdateItemComponent } from './components/update-item/update-item.component';

@Component({
    selector: 'app-inventory',
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
        FuseCardComponent,
        MatMenuModule,
        MatCheckboxModule,
        TextFieldModule,
        MatDividerModule,
        MatTooltipModule,
        MatSelectModule,
    ],
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
  
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagedData: Array<any>[] = [];
    filteredData: any[] = [];
    private _unsubscribeAll = new Subject<void>()
    pageSize = 10;
    pageIndex = 0;
    totalItems = 0;
    service: string = 'Inventory';
    dataForm: UntypedFormGroup;
  
    private dictData1 = new Map<number, string>();
    aData1: any;
    private dictData2 = new Map<number, string>();
    aData2: any;
    aData3: any;
    aData4: any;
    //length = 0;
    pageSizeOptions: number[] = [5, 10, 20, 40];
  
    //-------MENTODOS AUTOMATICOS----------//
    constructor(
      private _generalApi: GeneralApiService,
      private _toast: HotToastService,
      private _matDialog: MatDialog,
      private _formBuilder: UntypedFormBuilder
    ) { }
  
    ngOnInit() {

      this.dataForm = this._formBuilder.group({
        typeFilter: ['', [Validators.required],],
        typeSearch: ['', [Validators.required],],
      });

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


    find() {
       this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
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
      const typeFilter = this.dataForm.value.typeFilter;
      const typeSearch = this.dataForm.value.typeSearch;
      this._generalApi.getPagedQuery2(this.service, this.pageIndex + 1, this.pageSize,typeFilter, typeSearch)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (resp: ApiResponse<any>) => {
            if (resp.success) {
              this.filteredData = resp.data.data;
              this.totalItems = resp.data.meta.totalItemCount;
              // this.pagedData = this.filteredData;
              //this.updateListPaged();
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
      const dialogRef = this._matDialog.open(InventoryCreateComponent, {
        autoFocus: false,
        data: { row, action, data1: this.aData1, data2: this.aData2, data3: this.aData3, data4: this.aData4 },
        width: '85vw',
        maxWidth: '1200px',
        height: 'auto',
        disableClose: true,
      });
  
      dialogRef.afterClosed().subscribe((updated) => {
        if (!updated) {
          return;
        }
        this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        this._toast.success('Operación exitosa');
      });
    }

    openDialog2(row: any, action: number): void {
      const dialogRef = this._matDialog.open(InventoryUpdateComponent, {
        autoFocus: false,
        data: { row, action, data1: this.aData1, data2: this.aData2, data3: this.aData3, data4: this.aData4 },
        width: '85vw',
        maxWidth: '1200px',
        height: 'auto',
        disableClose: true,
      });
  
      dialogRef.afterClosed().subscribe((updated) => {
        if (!updated) {
          return;
        }
        this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        this._toast.success('Operación exitosa');
      });
    }

    
    openDialog3(row: any, action: number): void {
      const dialogRef = this._matDialog.open(UpdateItemComponent, {
        autoFocus: false,
        data: { row, action, data1: this.aData1, data2: this.aData2, data3: this.aData3, data4: this.aData4 },
        width: '85vw',
        maxWidth: '1200px',
        height: 'auto',
        disableClose: true,
      });
  
      dialogRef.afterClosed().subscribe((updated) => {
        if (!updated) {
          return;
        }
        this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        this._toast.success('Operación exitosa');
      });
    }
  
  
  
    getList(): void {
      const endpoints = ['InventoryEntryType','InventaryCategory', 'Donation/lastDonation' ,'UnitItem'];
      this._generalApi.comboList(endpoints)
        .subscribe({
          next: ([data1, data2, data3,data4]) => {
            this.aData1 = data1;
            this.aData2 = data2;
            this.aData3 = data3;
            this.aData4 = data4;
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
        { field: 'batchId', header: '#', width: '50px' },
        { field: 'name1', header: 'Nombre personal', width: '1fr'},
        { field: 'nameItem', header: 'Equipo', width: '1fr' },
        { field: 'quantity', header: 'Cantidad', width: '1fr', hideAt: 'lg' },
        { field: 'createdAt', header: 'Fecha de registro', width: '1fr', hideAt: 'lg' },
        { field: 'status', header: 'Devolucion', width: '1fr', hideAt: 'lg' },
        // { field: 'status', header: 'Estado', width: '130px', hideAt: 'lg' },
      ];
  
    actions: TableAction[] =
      [
        { action: 'view', label: 'Editar', icon: 'feather:eye' },
        { action: 'reverse', label: 'Reversar', icon: 'mat_solid:assignment_return' },
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
    }
    //-----DATOS DE NECESARIOS PARA LA TABLA-------//
}
