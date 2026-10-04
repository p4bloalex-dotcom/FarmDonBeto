import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { environment } from 'environments/environment';
import { TableAction, TableActionEvent, TableColumn } from './table-column.model';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CellFormatPipe } from '@fuse/pipes/cellFormatPipe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-table',
    imports: [
        CommonModule,
        MatIconModule,
        MatPaginatorModule,
        CellFormatPipe,
        MatTooltipModule,
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() actionColumnWidth = '120px';
  @Input() length: number | null = null;
  @Input() isLoading = false;
  @Output() pageChange = new EventEmitter<PageEvent>();
  actionColumnLabel = 'Acciones';
  pagedData: any[] = this.data;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 20, 40];
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['length']) {
      if (changes['data']) this.pageIndex = 0;
      this.updatePagedData();
    }
  }

  onPageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
    this.pageChange.emit(event);
  }

  @Output() rowAction = new EventEmitter<TableActionEvent>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  trackByFn(index: number, item: any) {
    return item?.id ?? index;
  }

  @HostListener('window:resize')
  onResize() {
    this.viewportWidth = window.innerWidth;
  }

  onAction(action: string, row: any) {
    this.rowAction.emit({ action, row });
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  get totalLength(): number { return this.length ?? this.data?.length ?? 0; }


  getGridTemplate(): string {
    return this.getVisibleColumns()
      .map(col => col.width ?? '1fr')
      .join(' ');
  }

  getVisibleColumns(): TableColumn[] {
    return this.columns.filter(col => !this.isHidden(col));
  }

  isPrimaryColumn(col: TableColumn): boolean {
    return this.getVisibleColumns()[0]?.field === col.field;
  }

  isHidden(col?: TableColumn): boolean {
    if (!col?.hideAt) return false;
    const bpMap = { sm: 640, md: 768, lg: 1024 };
    return this.viewportWidth < (bpMap[col.hideAt] ?? 0);
  }

  assetUrl(value: string): string {
    if (!value || value.startsWith('data:') || value.startsWith('http')) return value;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return apiRoot.startsWith('http') ? `${apiRoot}${value}` : value;
  }

  private updatePagedData(): void {
    if (this.pageChange.observed) {
      this.pagedData = this.data ?? [];
      return;
    }
    const start = this.pageIndex * this.pageSize;
    this.pagedData = (this.data ?? []).slice(start, start + this.pageSize);
  }


  
}
