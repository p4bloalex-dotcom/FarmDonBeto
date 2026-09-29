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
import { debounceTime, distinctUntilChanged, forkJoin, of, startWith, Subject, takeUntil } from 'rxjs';
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
  supplierMedicines: any[] = [];
  purchaseOrders: any[] = [];
  purchaseDetails: any[] = [];
  selectedOrder: any = null;
  orderLines: any[] = [];
  replenishmentSuggestions: any[] = [];
  flowForm: any = {
    branchId: null,
    supplierId: null,
    purchaseId: null,
    purchaseDetailId: null,
    medicineId: null,
    quantityReceived: 1,
    quantity: 1,
    unitPrice: 0,
    invoiceNumber: '',
    reason: 'Reposicion de stock',
    batchNumber: '',
    expirationDate: null,
    qualityStatus: 'AVAILABLE'
  };
  returnMode: 'accepted' | 'notAccepted' = 'accepted';
  networkQuery: any = { medicineId: null, branchId: null, quantity: null };
  networkResult: any = null;
  replenishmentLines: any[] = [];

  flowActions = [
    { value: 'requests', label: 'Necesito abastecer', description: '1. Validar stock interno y faltante.', icon: 'heroicons_outline:clipboard-document-list' },
    { value: 'orders', label: 'Crear orden', description: '2. Generar pedido al proveedor.', icon: 'heroicons_outline:shopping-cart' },
    { value: 'receipts', label: 'Recibir mercaderia', description: '3. Registrar lo que llego y lo que esta en buen estado.', icon: 'heroicons_outline:archive-box-arrow-down' },
    { value: 'invoices', label: 'Registrar factura', description: '4. Conciliar factura contra orden/recepcion.', icon: 'heroicons_outline:document-currency-dollar' },
    { value: 'returns', label: 'Devolver proveedor', description: '5. Registrar devolucion si hay rechazo o no conformidad.', icon: 'heroicons_outline:arrow-uturn-left' }
  ];

  flowHelp: Record<string, string> = {
    requests: 'Valide stock interno antes de comprar.',
    orders: '',
    receipts: '',
    invoices: '',
    returns: 'Devuelva producto ya recibido.'
  };

  actions: TableAction[] = [
    { action: 'view', label: 'Ver detalle', icon: 'feather:eye' },
    { action: 'edit', label: 'Editar borrador', icon: 'feather:edit', visible: row => this.canEditPurchase(row) },
    { action: 'approve', label: 'Aprobar orden', icon: 'heroicons_outline:check-circle', visible: row => row.status === 'PENDING_APPROVAL' },
    { action: 'delete', label: 'Eliminar borrador', icon: 'delete_forever', visible: row => this.canDeletePurchase(row) }
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
    this.loadReplenishmentSuggestions();
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
    this._generalApi.comboList(['Branch', 'Medicine', 'Supplier', 'SupplierMedicine']).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: ([branches, medicines, suppliers, supplierMedicines]: any[]) => {
        this.branches = branches ?? [];
        this.medicines = medicines ?? [];
        this.filterMedicines(this.medicineSearchControl.value);
        this.suppliers = suppliers ?? [];
        this.supplierMedicines = supplierMedicines ?? [];
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

  loadReplenishmentSuggestions(): void {
    this._generalApi.getReplenishmentSuggestions().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: resp => { if (resp.success) this.replenishmentSuggestions = resp.data ?? []; },
      error: () => { this.replenishmentSuggestions = []; }
    });
  }

  useSuggestion(suggestion: any): void {
    this.flowAction = 'requests';
    this.flowForm.branchId = suggestion.branchId;
    this.flowForm.medicineId = suggestion.medicineId;
    this.flowForm.quantity = suggestion.neededQuantity;
    this.flowForm.reason = `Reposicion sugerida por bajo inventario en ${suggestion.branchName}`;
    this.networkQuery = { medicineId: suggestion.medicineId, branchId: suggestion.branchId, quantity: suggestion.neededQuantity };
    this.networkResult = null;
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
        if (this.networkResult) {
          this.flowForm.branchId = this.networkQuery.branchId;
          this.flowForm.medicineId = this.networkQuery.medicineId;
          this.flowForm.quantity = this.networkResult.pendingExternalPurchase || this.networkQuery.quantity;
        }
        this.finishLoad(resp.success ? undefined : (resp.error?.detail ?? 'No se pudo verificar disponibilidad.'));
      },
      error: () => this.finishLoad('Error inesperado al verificar inventario de red.')
    });
  }

  submitReplenishment(): void {
    if (!this.networkResult && this.replenishmentLines.length === 0) {
      this.runNetworkCheck();
      return;
    }

    const lines = this.replenishmentLines.length ? this.replenishmentLines : [this.currentReplenishmentLine()];
    const transferGroups = new Map<string, any>();
    const purchaseGroups = new Map<number, any>();

    lines.filter(Boolean).forEach(line => {
      (line.transfers ?? []).forEach(branch => {
        const key = `${line.branchId}-${branch.branchId}`;
        const group = transferGroups.get(key) ?? {
          requestingBranchId: line.branchId,
          fulfillmentBranchId: branch.branchId,
          notes: this.flowForm.reason,
          details: []
        };
        group.details.push({ medicineId: line.medicineId, quantity: branch.suggested, unitCost: 0 });
        transferGroups.set(key, group);
      });

      if (line.pendingExternalPurchase > 0) {
        const group = purchaseGroups.get(line.branchId) ?? {
          branchId: line.branchId,
          priority: this.flowForm.priority ?? 'NORMAL',
          reason: this.flowForm.reason,
          details: []
        };
        group.details.push({ medicineId: line.medicineId, requestedQuantity: line.pendingExternalPurchase });
        purchaseGroups.set(line.branchId, group);
      }
    });

    const requests = [
      ...Array.from(transferGroups.values()).map(group => this._generalApi.add('DeliveryRequest', group)),
      ...Array.from(purchaseGroups.values()).map(group => this._generalApi.postPurchaseFlow('requests', group))
    ];

    if (requests.length === 0) return this.invalidFlow('No hay cantidad disponible para solicitar.');

    this.isLoading = true;
    forkJoin(requests).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: responses => {
        const failed: any = responses.find((resp: any) => resp && !resp.success);
        if (failed) {
          this.finishLoad(failed.error?.detail ?? 'No se pudo registrar el abastecimiento.');
          return;
        }
        this._toast.success(this.replenishmentActionLabel() + ' registrada.');
        this.networkResult = null;
        this.replenishmentLines = [];
        this.loadDashboard();
        this.loadReplenishmentSuggestions();
      },
      error: () => this.finishLoad('Error inesperado al registrar el abastecimiento.')
    });
  }

  addReplenishmentLine(): void {
    if (!this.networkResult) return;
    const line = this.currentReplenishmentLine();
    if (!line) return;
    const existingIndex = this.replenishmentLines.findIndex(item => item.branchId === line.branchId && item.medicineId === line.medicineId);
    if (existingIndex >= 0) this.replenishmentLines[existingIndex] = line;
    else this.replenishmentLines.push(line);
    this.networkResult = null;
    this.networkQuery.medicineId = null;
    this.networkQuery.quantity = null;
  }

  removeReplenishmentLine(index: number): void {
    this.replenishmentLines.splice(index, 1);
  }

  currentReplenishmentLine(): any {
    if (!this.networkResult) return null;
    const medicine = this.medicines.find(item => Number(item.id) === Number(this.networkQuery.medicineId));
    const branch = this.branches.find(item => Number(item.id) === Number(this.networkQuery.branchId));
    return {
      branchId: this.networkQuery.branchId,
      branchName: branch?.name ?? `Sucursal #${this.networkQuery.branchId}`,
      medicineId: this.networkQuery.medicineId,
      medicineName: this.medicineOptionLabel(medicine) || `Medicamento #${this.networkQuery.medicineId}`,
      requestedQuantity: Number(this.networkQuery.quantity ?? 0),
      pendingExternalPurchase: Number(this.networkResult.pendingExternalPurchase ?? 0),
      transfers: this.networkResult.suggestions ?? []
    };
  }

  canReviewNetwork(): boolean {
    return !!this.networkQuery.medicineId && !!this.networkQuery.branchId && Number(this.networkQuery.quantity ?? 0) > 0;
  }

  replenishmentActionLabel(): string {
    if (!this.networkResult) return 'Buscar abastecimiento';
    const hasTransfers = (this.networkResult.suggestions ?? []).length > 0;
    const hasPurchase = Number(this.networkResult.pendingExternalPurchase ?? 0) > 0;
    if (hasTransfers && hasPurchase) return 'Solicitar traslado y compra';
    if (hasTransfers) return 'Solicitar traslado';
    return 'Solicitar compra';
  }

  selectFlowAction(action: string): void {
    this.flowAction = action;
    this.networkResult = null;
    this.purchaseDetails = [];
    this.selectedOrder = null;
    this.flowForm.purchaseId = null;
    this.flowForm.purchaseDetailId = null;
  }

  onSupplierSelected(supplierId: number): void {
    this.flowForm.supplierId = supplierId;
    this.flowForm.medicineId = null;
    this.orderLines = [];
    this.filterMedicines(this.medicineSearchControl.value);
  }

  addOrderLine(): void {
    const medicineId = this.flowForm.medicineId;
    const quantity = Number(this.flowForm.quantity ?? 0);
    const unitPrice = Number(this.flowForm.unitPrice ?? 0);
    if (!medicineId || quantity <= 0 || unitPrice < 0) {
      this._toast.error('Seleccione medicamento, cantidad y precio de compra validos.');
      return;
    }
    const medicine = this.medicines.find(item => item.id === medicineId);
    const existing = this.orderLines.find(item => item.medicineId === medicineId);
    const line = {
      medicineId,
      medicineName: this.medicineOptionLabel(medicine) || `Medicamento #${medicineId}`,
      quantityOrdered: quantity,
      unitPrice,
      subtotal: quantity * unitPrice
    };
    if (existing) {
      Object.assign(existing, line);
    } else {
      this.orderLines.push(line);
    }
    this.flowForm.medicineId = null;
    this.flowForm.quantity = 1;
    this.flowForm.unitPrice = 0;
  }

  onOrderMedicineSelected(medicineId: number): void {
    if (this.flowAction !== 'orders' || !medicineId) return;
    const medicine = this.medicines.find(item => Number(item.id) === Number(medicineId));
    if (medicine && Number(this.flowForm.unitPrice ?? 0) === 0) {
      this.flowForm.unitPrice = Number(medicine.priceBuy ?? medicine.price_buy ?? 0);
    }
    if (this.flowForm.supplierId) return;
    const relation = this.supplierMedicines.find(item => Number(item.medicineId ?? item.medicine_id) === Number(medicineId));
    const supplierId = relation?.supplierId ?? relation?.supplier_id;
    if (supplierId) this.flowForm.supplierId = supplierId;
  }

  setUnitPrice(value: any): void {
    this.flowForm.unitPrice = this.parseDecimal(value);
  }

  setInvoiceTotal(value: any): void {
    this.flowForm.total = this.parseDecimal(value);
  }

  openNativePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    try {
      input?.showPicker?.();
    } catch {
      // Some browsers only allow opening native pickers during direct user activation.
    }
  }

  removeOrderLine(medicineId: number): void {
    this.orderLines = this.orderLines.filter(item => item.medicineId !== medicineId);
  }

  orderSubtotal(): number {
    return this.orderLines.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);
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
        if (this.flowAction === 'orders') this.orderLines = [];
        this.loadDashboard();
        this.loadReplenishmentSuggestions();
        if (this.flowForm.purchaseId) this.refreshSelectedOrder();
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
      if (!form.branchId || !form.supplierId) return this.invalidFlow('Seleccione sucursal destino y proveedor.');
      if (this.orderLines.length === 0) return this.invalidFlow('Agregue al menos un medicamento a la orden.');
      return { branchId: form.branchId, supplierId: form.supplierId, subtotal: this.orderSubtotal(), total: this.orderSubtotal(), details: this.orderLines };
    }
    if (this.flowAction === 'receipts') {
      const received = Number(form.quantityReceived ?? 0);
      if (!form.purchaseId || !form.purchaseDetailId || received <= 0) return this.invalidFlow('Seleccione orden, linea y cantidad recibida.');
      const detail = this.selectedDetail();
      const pending = this.detailPending(detail);
      const accepted = Number(form.quantity ?? 0);
      const rejected = Math.max(0, received - accepted);
      if (received > pending) return this.invalidFlow(`La cantidad que llego no puede superar lo pendiente por recibir (${pending}).`);
      if (accepted < 0) return this.invalidFlow('La cantidad en buen estado no puede ser negativa.');
      if (accepted > received) return this.invalidFlow('La cantidad en buen estado no puede superar la cantidad que llego.');
      if (rejected < 0) return this.invalidFlow('La cantidad no aceptada no puede ser negativa.');
      if (!form.batchNumber) return this.invalidFlow('Ingrese lote para validar la mercaderia.');
      if (!form.expirationDate) return this.invalidFlow('Ingrese vencimiento para validar la mercaderia.');
      return { purchaseId: form.purchaseId, details: [{ purchaseDetailId: form.purchaseDetailId, quantityReceived: received, quantityAccepted: accepted, quantityRejected: rejected, batchNumber: form.batchNumber || null, expirationDate: form.expirationDate || null, qualityStatus: rejected > 0 ? 'REJECTED' : (form.qualityStatus || 'AVAILABLE') }] };
    }
    if (this.flowAction === 'invoices') {
      if (!form.purchaseId || !form.supplierId || !form.invoiceNumber) return this.invalidFlow('Ingrese orden, proveedor y numero de factura.');
      const subtotal = this.acceptedTotal();
      const total = Number(form.total ?? subtotal);
      if (total <= 0) return this.invalidFlow('Ingrese un total de factura valido.');
      if (!['PARTIALLY_RECEIVED', 'RECEIVED', 'DISCREPANCY'].includes(this.selectedOrder?.status)) return this.invalidFlow('Solo puede facturar una orden con mercaderia recibida.');
      return { purchaseId: form.purchaseId, supplierId: form.supplierId, invoiceNumber: form.invoiceNumber, invoiceDate: new Date(), subtotal, tax: Number(form.tax ?? 0), discount: Number(form.discount ?? 0), total: Number(form.total ?? subtotal) };
    }
    if (this.flowAction === 'returns') {
      if (!form.purchaseId || !form.supplierId || !form.medicineId || quantity <= 0 || !form.reason) return this.invalidFlow('Ingrese orden, producto, cantidad y motivo.');
      const max = this.returnableQuantity();
      if (quantity > max) return this.invalidFlow(`La cantidad a devolver no puede superar ${max} para esta linea.`);
      return { purchaseId: form.purchaseId, supplierId: form.supplierId, medicineId: form.medicineId, quantity, batchNumber: form.batchNumber || null, returnMode: this.returnMode, reason: `${this.returnMode === 'accepted' ? 'Devolucion de producto en inventario' : 'Producto no aceptado en recepcion'}: ${form.reason}` };
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
        this.filteredData = (resp.data?.data ?? []).map(item => this.decorateRow(item));
        this.purchaseOrders = this.filteredData.filter(item => ['APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'INVOICED', 'DISCREPANCY'].includes(item.status));
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

  onPurchaseSelected(purchaseId: number): void {
    this.flowForm.purchaseDetailId = null;
    this.purchaseDetails = [];
    this.selectedOrder = null;
    if (!purchaseId) return;
    this._generalApi.GetById(this.service, purchaseId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) {
          this._toast.error(resp.error?.detail ?? 'No se pudo cargar el detalle de la orden.');
          return;
        }
        this.selectedOrder = this.decorateRow(resp.data);
        this.flowForm.branchId = resp.data?.branchId ?? resp.data?.branch_id ?? null;
        this.flowForm.supplierId = resp.data?.supplierId ?? resp.data?.supplier_id ?? null;
        this.flowForm.subtotal = Number(resp.data?.subtotal ?? 0);
        this.flowForm.total = Number(resp.data?.total ?? resp.data?.subtotal ?? 0);
        this.purchaseDetails = this.filterDetailsForCurrentStep(resp.data?.details ?? []);
        if (this.flowAction === 'invoices') {
          this.flowForm.subtotal = this.acceptedTotal();
          this.flowForm.total = this.acceptedTotal();
        }
        if (this.purchaseDetails.length === 1) {
          this.flowForm.purchaseDetailId = this.purchaseDetails[0].id;
          this.onPurchaseDetailSelected(this.purchaseDetails[0].id);
        }
      },
      error: () => this._toast.error('Error inesperado al cargar el detalle de la orden.')
    });
  }

  private refreshSelectedOrder(): void {
    const purchaseId = this.flowForm.purchaseId;
    if (!purchaseId) return;
    this._generalApi.GetById(this.service, purchaseId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) return;
        const currentDetailId = this.flowForm.purchaseDetailId;
        this.selectedOrder = this.decorateRow(resp.data);
        this.flowForm.branchId = resp.data?.branchId ?? resp.data?.branch_id ?? null;
        this.flowForm.supplierId = resp.data?.supplierId ?? resp.data?.supplier_id ?? null;
        this.flowForm.subtotal = Number(resp.data?.subtotal ?? 0);
        this.flowForm.total = Number(resp.data?.total ?? resp.data?.subtotal ?? 0);
        this.purchaseDetails = this.filterDetailsForCurrentStep(resp.data?.details ?? []);
        if (this.flowAction === 'invoices') {
          this.flowForm.subtotal = this.acceptedTotal();
          this.flowForm.total = this.acceptedTotal();
        }
        const stillPending = this.purchaseDetails.find(item => item.id === currentDetailId);
        this.flowForm.purchaseDetailId = stillPending?.id ?? null;
        if (stillPending) this.onPurchaseDetailSelected(stillPending.id);
      }
    });
  }

  onPurchaseDetailSelected(detailId: number): void {
    const detail = this.purchaseDetails.find(item => item.id === detailId);
    if (!detail) return;
    const pending = Number(detail.quantityPending ?? Math.max(0, Number(detail.quantity ?? 0) - Number(detail.quantityReceived ?? 0)));
    this.flowForm.medicineId = detail.medicineId ?? detail.medicine_id ?? null;
    this.flowForm.unitPrice = Number(detail.unitPrice ?? detail.unit_price ?? 0);
    this.flowForm.quantityReceived = pending > 0 ? pending : 1;
    this.flowForm.quantity = this.flowAction === 'returns' ? Math.max(1, Number(detail.quantityReceived ?? 0)) : (pending > 0 ? pending : 1);
    this.flowForm.quantityRejected = 0;
  }

  handleRowAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.openPurchaseDialog(event.row, 7);
    if (event.action === 'edit') this.openPurchaseDialog(event.row, 2);
    if (event.action === 'approve') this.approveSelected(event.row);
    if (event.action === 'delete') this.deletePurchase(event.row.id);
  }

  canEditPurchase(row: any): boolean {
    return ['E', 'DRAFT'].includes(row?.status);
  }

  canDeletePurchase(row: any): boolean {
    return ['E', 'DRAFT', 'PENDING_APPROVAL'].includes(row?.status);
  }

  private decorateRow(item: any): any {
    const numberFormat = (value: number) => (value == null ? '0.00' : Number(value).toFixed(2));
    return {
      ...item,
      purchaseDateLabel: item.purchaseDate ? new Date(item.purchaseDate).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
      totalLabel: `Q ${numberFormat(item.total ?? item.subtotal)}`,
      statusLabel: this.statusLabel(item.status)
    };
  }

  private statusLabel(status: string): string {
    const labels: Record<string, string> = {
      E: 'Registrada',
      I: 'Anulada',
      DRAFT: 'Borrador',
      PENDING_APPROVAL: 'Pendiente de aprobacion',
      APPROVED: 'Aprobada',
      PARTIALLY_RECEIVED: 'Recepcion parcial',
      RECEIVED: 'Recibida',
      INVOICED: 'Facturada',
      DISCREPANCY: 'Con discrepancia'
    };
    return labels[status] ?? status ?? '-';
  }

  medicineOptionLabel(item: any): string {
    if (!item) return '';
    return [item.code, item.name].filter(Boolean).join(' - ');
  }

  orderMedicines(): any[] {
    const supplierId = Number(this.flowForm.supplierId ?? 0);
    if (!supplierId) return [];
    const medicineIds = new Set(
      this.supplierMedicines
        .filter(item => Number(item.supplierId ?? item.supplier_id) === supplierId)
        .map(item => Number(item.medicineId ?? item.medicine_id))
    );
    return this.filteredMedicines.filter(item => medicineIds.has(Number(item.id)));
  }

  purchaseOrderLabel(item: any): string {
    if (!item) return '';
    return `${item.purchaseNumber || ('#' + item.id)} - ${item.supplierName || 'Proveedor'} - ${item.statusLabel} - ${item.totalLabel}`;
  }

  purchaseDetailLabel(item: any): string {
    if (!item) return '';
    const pending = Number(item.quantityPending ?? Math.max(0, Number(item.quantity ?? 0) - Number(item.quantityReceived ?? 0)));
    return `${item.medicineName || 'Medicamento'} - falta recibir ${pending} de ${item.quantityOrdered ?? item.quantity}`;
  }

  detailPending(detail: any): number {
    if (!detail) return 0;
    return Number(detail.quantityPending ?? Math.max(0, Number(detail.quantityOrdered ?? detail.quantity ?? 0) - Number(detail.quantityReceived ?? 0)));
  }

  detailOrdered(detail: any): number {
    return Number(detail?.quantityOrdered ?? detail?.quantity ?? 0);
  }

  detailReceived(detail: any): number {
    return Number(detail?.quantityReceived ?? 0);
  }

  detailRejected(detail: any): number {
    return Number(detail?.quantityRejected ?? 0);
  }

  detailAccepted(detail: any): number {
    return Math.max(0, this.detailReceived(detail) - this.detailRejected(detail));
  }

  amount(value: any): string {
    return Number(value ?? 0).toFixed(2);
  }

  money(value: any): string {
    return `Q ${this.amount(value)}`;
  }

  receiptProgress(): { total: number; completed: number; pending: number } {
    const details = this.selectedOrder?.details ?? [];
    const total = details.length;
    const completed = details.filter(detail => this.detailPending(detail) <= 0).length;
    return { total, completed, pending: Math.max(0, total - completed) };
  }

  orderedTotal(): number {
    const details = this.selectedOrder?.details ?? [];
    return details.reduce((sum, detail) => sum + (this.detailOrdered(detail) * Number(detail.unitPrice ?? 0)), 0);
  }

  acceptedTotal(): number {
    const details = this.selectedOrder?.details ?? [];
    return details.reduce((sum, detail) => sum + (this.detailAccepted(detail) * Number(detail.unitPrice ?? 0)), 0);
  }

  notAcceptedTotal(): number {
    const details = this.selectedOrder?.details ?? [];
    return details.reduce((sum, detail) => sum + (this.detailRejected(detail) * Number(detail.unitPrice ?? 0)), 0);
  }

  pendingReceiveTotal(): number {
    const details = this.selectedOrder?.details ?? [];
    return details.reduce((sum, detail) => sum + (this.detailPending(detail) * Number(detail.unitPrice ?? 0)), 0);
  }

  invoiceDifference(): number {
    const expected = this.acceptedTotal();
    const actual = Number(this.flowForm.total ?? expected);
    return Math.round((actual - expected) * 100) / 100;
  }

  invoiceStatusMessage(): string {
    const difference = this.invoiceDifference();
    if (difference === 0) return 'Factura coincide con lo recibido en buen estado.';
    if (difference > 0) return `Factura mayor a lo pagable por ${this.money(difference)}. Solicite correccion o nota de credito.`;
    return `Factura menor a lo recibido en buen estado por ${this.money(Math.abs(difference))}. Revise descuentos o faltante de factura.`;
  }

  rejectedQuantity(): number {
    return Math.max(0, Number(this.flowForm.quantityReceived ?? 0) - Number(this.flowForm.quantity ?? 0));
  }

  returnableAcceptedQuantity(detail: any = this.selectedDetail()): number {
    return this.detailAccepted(detail);
  }

  returnableNotAcceptedQuantity(detail: any = this.selectedDetail()): number {
    return this.detailRejected(detail);
  }

  returnableQuantity(): number {
    return this.returnMode === 'accepted' ? this.returnableAcceptedQuantity() : this.returnableNotAcceptedQuantity();
  }

  availablePurchaseOrders(): any[] {
    const allowed: Record<string, string[]> = {
      receipts: ['APPROVED', 'PARTIALLY_RECEIVED'],
      invoices: ['PARTIALLY_RECEIVED', 'RECEIVED', 'DISCREPANCY'],
      returns: ['RECEIVED', 'INVOICED', 'DISCREPANCY']
    };
    const statuses = allowed[this.flowAction] ?? [];
    return this.purchaseOrders.filter(item => statuses.includes(item.status));
  }

  private filterDetailsForCurrentStep(details: any[]): any[] {
    if (this.flowAction === 'receipts') {
      return details.filter(detail => Number(detail.quantityPending ?? detail.quantity ?? 0) > 0);
    }
    if (this.flowAction === 'returns') {
      return details.filter(detail => Number(detail.quantityReceived ?? 0) > 0);
    }
    return details;
  }

  selectedDetail(): any {
    return this.purchaseDetails.find(item => item.id === this.flowForm.purchaseDetailId) ?? null;
  }

  private filterMedicines(searchText: string = ''): void {
    const text = (searchText ?? '').toString().trim().toLowerCase();
    this.filteredMedicines = text
      ? this.medicines.filter(item => this.medicineOptionLabel(item).toLowerCase().includes(text))
      : this.medicines;
  }

  private parseDecimal(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const normalized = String(value).replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private finishLoad(message?: string): void {
    this.isLoading = false;
    if (message) this._toast.error(message);
  }
}
