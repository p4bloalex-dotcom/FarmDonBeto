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
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { BranchDialogComponent } from './components/branch-dialog/branch-dialog.component';

@Component({
  selector: 'app-branch',
  imports: [MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatSortModule, TableComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class BranchComponent {
  searchInputControl = new UntypedFormControl();
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'Branch';
  private _unsubscribeAll = new Subject<void>();

  constructor(private _generalApi: GeneralApiService, private _toast: HotToastService, private _matDialog: MatDialog) {}

  ngOnInit(): void {
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged()).subscribe(searchText => {
      const text = searchText?.toLowerCase() || '';
      this.pagedData = this.filteredData.filter(item => item.name?.toLowerCase().includes(text));
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this.filteredData = resp.data.data;
          this.totalItems = resp.data.meta.totalItemCount;
          this.pagedData = this.filteredData;
        } else {
          this._toast.error(resp.error.detail);
        }
      },
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(BranchDialogComponent, { autoFocus: false, data: { row, action }, width: '80vw', maxWidth: '1100px', height: 'auto', disableClose: true });
    dialogRef.afterClosed().subscribe(updated => {
      if (!updated) return;
      const { idAction, ...payload } = updated;
      if (idAction === 1) this.filteredData = [payload, ...this.filteredData];
      if (idAction === 2) this.filteredData = this.filteredData.map(item => item.idBranch === payload.idData ? { ...item, ...payload } : item);
      if (idAction === 4) this.filteredData = this.filteredData.filter(item => item.idBranch !== payload.idData);
      this.pagedData = this.filteredData;
      this._toast.success('Operación exitosa');
    });
  }

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', width: '2fr' ,},
    { field: 'phone', header: 'Telefono', width: '1fr', },
    { field: 'status', header: 'Estado', width: '120px', }
  ];

  actions: TableAction[] = [
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
  ];

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.openDialog(event.row, 2);
    if (event.action === 'delete') this.openDialog(event.row, 4);
  }
}
