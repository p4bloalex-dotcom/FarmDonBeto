import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { HotToastService } from '@fuse/components/hot-toast';
import { TableAction, TableColumn } from '@fuse/components/table/table-column.model';
import { TableComponent } from '@fuse/components/table/table.component';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
import { PurchaseFormDialogComponent } from './purchase-form-dialog/purchase-form-dialog.component';

@Component({
  selector: 'app-purchase',
imports: [
      CommonModule, FormsModule, ReactiveFormsModule,
      MatProgressBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSortModule, MatSelectModule,
      TableComponent
    ],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  medicineSearchControl: UntypedFormControl = new UntypedFormControl('');
  pagedData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  service = 'Purchase';
  isLoading = false;
  dashboard: any = {};
  flowAction = 'requests';
  branches: any[] = [];
  medicines: any[] = [];
  filteredMedicines: any[] = [];
  suppliers: any[] = [];
  flowForm: any = {
    branchId: null,
    supplierId: null,
    purchaseId: null,
    purchaseDetailId: null,
    medicineId: null,
    quantity: 1,
    unitPrice: 0,
    invoiceNumber: '',
    reason: 'Reposicion de stock',
    batchNumber: '',
    expirationDate: null,
    qualityStatus: 'AVAILABLE'
  };
  networkQuery: any = { medicineId: null, branchId: null, quantity: null };
  networkResult: any = null;

  flowActions = [
    { value: 'requests', label: 'Necesito abastecer', description: '', icon: 'heroicons_outline:clipboard-document-list' },
    { value: 'orders', label: 'Crear orden', description: '', icon: 'heroicons_outline:shopping-cart' },
    { value: 'receipts', label: 'Recibir mercaderia', description: 'Registra lotes, vencimientos y solo suma lo aceptado al inventario.', icon: 'heroicons_outline:archive-box-arrow-down' },
    { value: 'invoices', label: 'Registrar factura', description: 'Compara factura contra orden y recepcion.', icon: 'heroicons_outline:document-currency-dollar' },
    { value: 'returns', label: 'Devolver proveedor', description: 'Registra producto rechazado o no conforme.', icon: 'heroicons_outline:arrow-uturn-left' }
  ];

  flowHelp: Record<string, string> = {
    requests: 'Validar inventario.',
    orders: '',
    receipts: 'Use este paso cuando llega el producto fisicamente. Solo la cantidad aceptada entra al inventario disponible.',
    invoices: 'Use este paso cuando llega la factura del proveedor. El sistema marca coincidencia o discrepancia.',
    returns: 'Use este paso para devolver producto rechazado, danado, vencido o no conforme al proveedor.'
  };

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar', icon: 'feather:edit' },
    { action: 'approve', label: 'Aprobar orden', icon: 'heroicons_outline:check-circle' },
    { action: 'delete', label: 'Eliminar', icon: 'delete_forever' }
  ];

  columns: TableColumn[] = [
    { field: 'purchaseDateLabel', header: 'Fecha', width: '1.5fr' },
    { field: 'supplierName', header: 'Proveedor', width: '1.5fr' },
    { field: 'invoiceNumber', header: 'Factura', width: '1fr' },
    { field: 'itemsCount', header: 'Items', width: '70px' },
    { field: 'totalLabel', header: 'Total', width: '1fr' },
    { field: 'statusLabel', header: 'Estado', width: '110px' }
  ];

  private _unsubscribeAll = new Subject<void>();

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadCombos();
    this.loadDashboard();
    this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
    this.searchInputControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(searchText => {
        const text = searchText?.toLowerCase() || '';
        this.pagedData = this.filteredData.filter(item => JSON.stringify(item).toLowerCase().includes(text));
      });
    this.medicineSearchControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), startWith(''), debounceTime(200), distinctUntilChanged())
      .subscribe(searchText => this.filterMedicines(searchText));
  }

  loadCombos(): void {
    this._generalApi.comboList(['Branch', 'Medicine', 'Supplier']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([branches, medicines, suppliers]: any[]) => {
        this.branches = branches ?? [];
        this.medicines = medicines ?? [];
        this.filterMedicines(this.medicineSearchControl.value);
        this.suppliers = suppliers ?? [];
      },
      error: () => this._toast.error('No se pudieron cargar sucursales, medicamentos o proveedores.')
    });
  }

  loadDashboard(): void {
    this._generalApi.getPurchaseDashboard().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { if (resp.success) this.dashboard = resp.data ?? {}; },
      error: () => { this.dashboard = {}; }
    });
  }

  runNetworkCheck(): void {
    if (!this.networkQuery.medicineId || !this.networkQuery.branchId || !this.networkQuery.quantity) {
      this._toast.error('Seleccione medicamento, sucursal y cantidad para revisar la red.');
      return;
    }
    this.isLoading = true;
    this._generalApi.getPurchaseNetworkAvailability(this.networkQuery).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => {
        this.networkResult = resp.success ? resp.data : null;
        this.finishLoad(resp.success ? undefined : (resp.error?.detail ?? 'No se pudo verificar disponibilidad.'));
      },
      error: () => this.finishLoad('Error inesperado al verificar inventario de red.')
    });
  }

  selectFlowAction(action: string): void {
    this.flowAction = action;
    this.networkResult = null;
  }

  get selectedFlow(): any {
    return this.flowActions.find(action => action.value === this.flowAction) ?? this.flowActions[0];
  }

  submitFlow(): void {
    const payload = this.buildFlowPayload();
    if (!payload) return;
    this.isLoading = true;
    this._generalApi.postPurchaseFlow(this.flowAction, payload).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => {
        if (!resp.success) {
          this.finishLoad(resp.error?.detail ?? 'No se pudo completar la operacion.');
          return;
        }
        this._toast.success(resp.message ?? 'Operacion registrada.');
        this.loadDashboard();
        this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      },
      error: () => this.finishLoad('Error inesperado al ejecutar el flujo de compras.')
    });
  }

  private buildFlowPayload(): any {
    const form = this.flowForm;
    const quantity = Number(form.quantity ?? 0);
    const unitPrice = Number(form.unitPrice ?? 0);
    if (this.flowAction === 'requests') {
      if (!form.branchId || !form.medicineId || quantity <= 0) return this.invalidFlow('Seleccione sucursal, medicamento y cantidad.');
      return { branchId: form.branchId, priority: form.priority ?? 'NORMAL', reason: form.reason, details: [{ medicineId: form.medicineId, requestedQuantity: quantity }] };
    }
    if (this.flowAction === 'orders') {
      if (!form.branchId || !form.supplierId || !form.medicineId || quantity <= 0) return this.invalidFlow('Seleccione sucursal, proveedor, medicamento y cantidad.');
      return { branchId: form.branchId, supplierId: form.supplierId, details: [{ medicineId: form.medicineId, quantityOrdered: quantity, unitPrice }] };
    }
    if (this.flowAction === 'receipts') {
      if (!form.purchaseId || !form.purchaseDetailId || quantity <= 0) return this.invalidFlow('Ingrese orden, linea de orden y cantidad aceptada.');
      return { purchaseId: form.purchaseId, details: [{ purchaseDetailId: form.purchaseDetailId, quantityReceived: quantity, quantityAccepted: quantity, quantityRejected: Number(form.quantityRejected ?? 0), batchNumber: form.batchNumber || null, expirationDate: form.expirationDate || null, qualityStatus: form.qualityStatus || 'AVAILABLE' }] };
    }
    if (this.flowAction === 'invoices') {
      if (!form.purchaseId || !form.supplierId || !form.invoiceNumber) return this.invalidFlow('Ingrese orden, proveedor y numero de factura.');
      const subtotal = quantity * unitPrice;
      return { purchaseId: form.purchaseId, supplierId: form.supplierId, invoiceNumber: form.invoiceNumber, invoiceDate: new Date(), subtotal, tax: Number(form.tax ?? 0), discount: Number(form.discount ?? 0), total: Number(form.total ?? subtotal) };
    }
    if (this.flowAction === 'returns') {
      if (!form.purchaseId || !form.supplierId || !form.medicineId || quantity <= 0 || !form.reason) return this.invalidFlow('Ingrese proveedor, compra, medicamento, cantidad y motivo.');
      return { purchaseId: form.purchaseId, supplierId: form.supplierId, medicineId: form.medicineId, quantity, batchNumber: form.batchNumber || null, reason: form.reason };
    }
    return null;
  }

  private invalidFlow(message: string): null {
    this._toast.error(message);
    return null;
  }

  approveSelected(row: any): void {
    this.isLoading = true;
    this._generalApi.approvePurchaseOrder(row.id, 'Aprobado desde modulo de compras').pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => {
        if (resp.success) {
          this._toast.success('Orden aprobada.');
          this.loadDashboard();
          this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        } else {
          this.finishLoad(resp.error?.detail ?? 'No se pudo aprobar la orden.');
        }
      },
      error: () => this.finishLoad('Error inesperado al aprobar la orden.')
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.isLoading = true;
    this._generalApi.getPaged(this.service, this.pageIndex + 1, this.pageSize).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'Error al cargar las compras.');
          this.finishLoad();
          return;
        }
        this.filteredData = (resp.data?.data ?? []).map(this.decorateRow);
        this.totalItems = resp.data?.meta?.totalItemCount ?? 0;
        this.pagedData = this.filteredData;
        this.finishLoad();
      },
      error: () => this.finishLoad('Error inesperado al cargar las compras.')
    });
  }

  openPurchaseDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(PurchaseFormDialogComponent, {
      autoFocus: false,
      data: { row, action },
      width: '94vw',
      maxWidth: '900px',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(updated => {
      if (!updated) return;
      this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
      this._toast.success('Operacion exitosa');
    });
  }

  deletePurchase(id: number): void {
    this.isLoading = true;
    this._generalApi.delete(this.service, id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (resp.success) {
          this._toast.success('Compra eliminada correctamente. El inventario fue actualizado.');
          this.onPageChange({ pageIndex: 0, pageSize: this.pageSize } as PageEvent);
        } else {
          this._toast.error(resp.error?.detail ?? 'No se pudo eliminar la compra.');
          this.finishLoad();
        }
      },
      error: () => this.finishLoad('Error inesperado al eliminar la compra.')
    });
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openPurchaseDialog(event.row, 7);
    if (event.action === 'edit') this.openPurchaseDialog(event.row, 2);
    if (event.action === 'approve') this.approveSelected(event.row);
    if (event.action === 'delete') this.deletePurchase(event.row.id);
  }

  private decorateRow(item: any): any {
    const numberFormat = (value: number) => (value == null ? '0.00' : Number(value).toFixed(2));
    return {
      ...item,
      purchaseDateLabel: item.purchaseDate ? new Date(item.purchaseDate).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
      totalLabel: `Q ${numberFormat(item.total ?? item.subtotal)}`,
      statusLabel: item.status === 'E' ? 'Registrada' : item.status === 'I' ? 'Anulada' : item.status ?? '-'
    };
  }

  medicineOptionLabel(item: any): string {
    if (!item) return '';
    return [item.code, item.name].filter(Boolean).join(' - ');
  }

  private filterMedicines(searchText: string = ''): void {
    const text = (searchText ?? '').toString().trim().toLowerCase();
    this.filteredMedicines = text
      ? this.medicines.filter(item => this.medicineOptionLabel(item).toLowerCase().includes(text))
      : this.medicines;
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
