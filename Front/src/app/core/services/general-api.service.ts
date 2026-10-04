import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { environment } from 'environments/environment';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralApiService {
  private _httpClient = inject(HttpClient);
  constructor() { }

getList(endpoint: string) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}`)
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  getSessions(status?: string) {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath('CashSession')}`, { params })
      .pipe(map(resp => this.normalizeResponse('CashSession', resp)));
  }

  getSessionBalance(sessionId: number) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath('CashSession')}/${sessionId}/balance`)
      .pipe(map(resp => this.normalizeResponse('CashSession', resp)));
  }

  closeSession(sessionId: number, data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath('CashSession')}/${sessionId}/close`, data)
      .pipe(map(resp => this.normalizeResponse('CashSession', resp)));
  }

  getMovementsBySession(sessionId: number) {
    const params = new HttpParams().set('sessionId', sessionId);
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath('CashMovement')}`, { params })
      .pipe(map(resp => this.normalizeResponse('CashMovement', resp)));
  }

  postAction(endpoint: string, id: any, action: string, data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}/${action}`, data)
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  getAction(endpoint: string, id: any, action: string) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}/${action}`)
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  customerOrderAvailability(data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath('CustomerOrder')}/availability`, data)
      .pipe(map(resp => this.normalizeResponse('CustomerOrder', resp)));
  }

  getConsolidatedReport(report: string, filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]);
    });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/reports/consolidated/${report}`, { params });
  }

  downloadConsolidatedReport(report: string, format: 'xlsx' | 'pdf', filters: any = {}) {
    let params = new HttpParams().set('format', format);
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]);
    });
    return this._httpClient.get(`${environment.apiUrl}/reports/consolidated/${report}`, { params, responseType: 'blob' });
  }

  getInventoryKardex(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key]) params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/kardex`, { params });
  }

  getInventoryLots(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key]) params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/lots`, { params });
  }

  getLowStockAlerts() {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/alerts/low-stock`);
  }

  getInventoryAlerts(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/alerts`, { params });
  }

  getInventoryAvailability(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/availability`, { params });
  }

  getReplenishmentSuggestions(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/replenishment-suggestions`, { params });
  }

  createInventoryReservation(data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/reservations`, data);
  }

  getPurchaseDashboard() {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/purchases/dashboard`);
  }

  getPurchaseNetworkAvailability(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => { if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]); });
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/purchases/network-availability`, { params });
  }

  getPurchaseRequests() {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/purchases/requests`);
  }

  postPurchaseFlow(path: string, data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/purchases/${path}`, data);
  }

  approvePurchaseOrder(id: number, comments = '') {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/purchases/orders/${id}/approve`, { comments });
  }

  getDashboardSummary() {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/dashboard/summary`);
  }

  getCashAdvanced(path: string) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/cash-advanced/${path}`);
  }

  postCashAdvanced(path: string, data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/cash-advanced/${path}`, data);
  }

  addInventoryAdjustment(data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/inventory/adjustments`, data);
  }

  getPayroll(path: string) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/${path}`);
  }

  postPayroll(path: string, data: any) {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/${path}`, data);
  }

  putPayroll(path: string, id: any, data: any) {
    return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/${path}/${id}`, data);
  }

  voidPayrollPayment(id: any, reason: string) {
    return this._httpClient.patch<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/payments/${id}/void`, { reason });
  }

  updatePayrollPeriodStatus(id: any, status: any) {
    const payload = typeof status === 'string' ? { status } : status;
    return this._httpClient.patch<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/periods/${id}/status`, payload);
  }

  getTreasury(path: string) { return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/treasury/${path}`); }
  postTreasury(path: string, data: any) { return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/catalog/treasury/${path}`, data); }
  putTreasury(path: string, id: any, data: any) { return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/catalog/treasury/${path}/${id}`, data); }
  patchTreasury(path: string, id: any, action: string, data: any) { return this._httpClient.patch<ApiResponse<any>>(`${environment.apiUrl}/catalog/treasury/${path}/${id}/${action}`, data); }

  getPayrollPaymentDetails(id: any) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/catalog/payroll/payments/${id}/details`);
  }

  modify(endpoint: string, id: any, data: any) {
    return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}`, this.toNodePayload(endpoint, data))
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  changeStatus(endpoint: string, id: any, data: any) {
    if (endpoint === 'Menu' || endpoint === 'DeliveryRequest' || endpoint === 'CustomerOrder') {
      return this._httpClient.patch<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}/status`, { status: data.status })
        .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
    }

    return this.modify(endpoint, id, data);
  }

  getPaged(endpoint: string, pageIndex: number, pageSize: number) {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    if (endpoint === 'Menu' || endpoint === 'PayrollPosition' || endpoint === 'PayrollConcept') {
      return this.getClientPagedList(endpoint, pageIndex, pageSize);
    }

    return this._httpClient.get<any>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/pagination`, { params })
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  getPagedFiltered(endpoint: string, pageIndex: number, pageSize: number, filters: any = {}) {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]);
    });
    return this._httpClient.get<any>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/pagination`, { params })
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  exportAudit(filters: any = {}): Observable<HttpResponse<Blob>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') params = params.set(key, filters[key]);
    });
    return this._httpClient.get(`${environment.apiUrl}/security/audit/export`, { params, responseType: 'blob', observe: 'response' });
  }

  getPagedQuery(endpoint: string, pageIndex: number, pageSize: number, idData: number) {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('IdData', idData);
    return this._httpClient.get<any>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/pagination`, { params })
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  getPagedQuery2(endpoint: string, pageIndex: number, pageSize: number, typeFilter: any, dataFilter: any) {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('typeFilter', typeFilter)
      .set('dataFilter', dataFilter);
    return this._httpClient.get<any>(`${environment.apiUrl}/${endpoint}/pagination`, { params });
  }

  getPagedQueryForDate(endpoint: string, endDate: any, startDate: any) {
    const params = new HttpParams()
      .set('endDate', endDate)
      .set('startDate', startDate);
    return this._httpClient.get<any>(`${environment.apiUrl}/${endpoint}/pagination`, { params });
  }


  add(endpoint: string, data: any) {
    if (endpoint === 'RoleAction') {
      const calls = data
        .filter((item: any) => item.permissionId)
        .map((item: any) => this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}`, {
          roleId: item.roleId,
          permissionId: item.permissionId,
          isCheck: item.isCheck
        }));

      if (calls.length === 0) {
        return new Observable(observer => {
          observer.next({ success: true, data: 'Sin permisos para actualizar', error: null });
          observer.complete();
        });
      }

      return forkJoin(calls).pipe(map(() => ({ success: true, data: 'Permisos actualizados', error: null })));
    }

    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}`, this.toNodePayload(endpoint, data))
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  getRoleMenus(idRole: number) {
    const params = new HttpParams().set('idRole', idRole);
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/security/role-menus`, { params })
      .pipe(map(resp => this.normalizeResponse('MenuRol', resp)));
  }

  saveRoleMenus(idRole: number, menus: any[]) {
    return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/security/role-menus/bulk`, { idRole, menus })
      .pipe(map(resp => this.normalizeResponse('MenuRol', resp)));
  }

  delete(endpoint: string, id: any): any {
    return this._httpClient.delete<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}`)
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  reverse(endpoint: string, batchId: any): any {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/reverse/${batchId}`, {});
  }


  recieve(endpoint: string, data: any): any {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/receive`, data);
  }

  unsuscribe(endpoint: string, data: any): any {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/unsubscribe`, data);
  }





  GetById(endpoint: string, id: any): any {
    if (endpoint === 'Role') {
      return forkJoin({
        role: this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}`),
        screens: this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/security/permissions/screens`),
        menus: this.getList('Menu'),
        roleMenus: this.getRoleMenus(id)
      }).pipe(map(({ role, screens, menus, roleMenus }) => this.toRolePermissionTree(role, screens, id, menus, roleMenus)));
    }

    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${this.endpointPath(endpoint)}/${id}`)
      .pipe(map(resp => this.normalizeResponse(endpoint, resp)));
  }

  GetBySearch(endpoint: string, data: any): any {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/find`, data);
  }


  comboList(endpoints: string[]): any {
    const calls = endpoints.map(ep =>
      this.getList(ep).pipe(
        map((resp: ApiResponse<any>) => {
          if (resp.success == false) {
            throw new Error(resp.error.detail);
          }
          return resp.data;
        }),
        // catchError(err => {
        //   return of([] as any[]);
        // })
      )
    );
    return forkJoin(calls);
  }


  uploadFormDataFile(endpoint: string, formData: FormData): any {
    const url = `${environment.apiUrl}/${endpoint}/UploadFile`;
    return this._httpClient.post<ApiResponse<any>>(url, formData);
  }

  downloadFile(endpoint: string, idData: number): Observable<HttpResponse<Blob>> {
    return this._httpClient.get(`${environment.apiUrl}/${endpoint}/paper/${idData}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  downloadReport(endpoint: string, data: any): Observable<HttpResponse<Blob>> {
    return this._httpClient.post(`${environment.apiUrl}/${endpoint}/report`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  makeAttendance(data: any, token: string) {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this._httpClient.post<any>(
    `${environment.apiUrl}/MakeAttendance/attendance`,
    data,
    { headers }
  );
}

  private endpointPath(endpoint: string): string {
    const mapEndpoints: Record<string, string> = {
      Role: 'security/roles',
      Menu: 'security/menus',
      Permission: 'security/permissions',
      RoleAction: 'security/permissions/role',
      MenuRol: 'security/role-menus',
      User: 'security/users',
      Audit: 'security/audit',
      Company: 'catalog/companies',
      'Company/findByUser': 'catalog/companies/findByUser',
      Personal: 'catalog/personals',
      Branch: 'catalog/branches',
      Department: 'catalog/departments',
      Municipality: 'catalog/municipalities',
      MedicineCategory: 'catalog/medicine-categories',
      MedicineLaboratory: 'catalog/medicine-laboratories',
      MedicinePresentation: 'catalog/medicine-presentations',
      Medicine: 'catalog/medicines',
Supplier: 'catalog/suppliers',
      SupplierMedicine: 'catalog/supplier-medicines',
      UnitMeasurement: 'catalog/unit-measurements',
      CashMovementType: 'catalog/cash-movement-types',
      MovementType: 'catalog/movement-types',
      CashRegister: 'catalog/cash-registers',
      CashSession: 'catalog/cash-sessions',
      CashMovement: 'catalog/cash-movements',
      CashAdvanced: 'catalog/cash-advanced',
      Purchase: 'catalog/purchases',
      StockTransfer: 'catalog/stock-transfers',
      DeliveryRequest: 'catalog/delivery-requests',
      Inventory: 'catalog/inventory',
      FixedAsset: 'catalog/fixed-assets',
      CustomerOrder: 'catalog/customer-orders',
      Sale: 'catalog/sales',
      Payroll: 'catalog/payroll',
      PayrollPosition: 'catalog/payroll/positions',
      PayrollConcept: 'catalog/payroll/concepts'
    };

    return mapEndpoints[endpoint] ?? endpoint;
  }

  private toNodePayload(endpoint: string, data: any): any {
    if (endpoint !== 'Menu') {
      return data;
    }

    return {
      ...data,
      idMenuFather: data.idMenuFather ?? data.id_menu_father ?? null,
      order: Number(data.order ?? 0)
    };
  }

  private normalizeResponse(endpoint: string, response: any): ApiResponse<any> {
    if (!response) {
      return response;
    }

    const normalized = {
      ...response,
      error: response.error ?? (response.success === false ? { title: 'Error', status: 400, detail: response.message } : null)
    };

    if (normalized.data?.meta) {
      normalized.data.meta = {
        ...normalized.data.meta,
        totalItemCount: normalized.data.meta.totalItemCount ?? normalized.data.meta.totalCount
      };
    }

    if (endpoint === 'Menu') {
      if (Array.isArray(normalized.data)) {
        normalized.data = normalized.data.map(item => this.normalizeMenu(item));
      }
      if (Array.isArray(normalized.data?.data)) {
        normalized.data.data = normalized.data.data.map(item => this.normalizeMenu(item));
      }
    }

    if (endpoint === 'Role') {
      if (Array.isArray(normalized.data)) {
        normalized.data = normalized.data.map(item => this.normalizeRole(item));
      }
      if (Array.isArray(normalized.data?.data)) {
        normalized.data.data = normalized.data.data.map(item => this.normalizeRole(item));
      }
    }

    if (endpoint === 'Personal') {
      if (Array.isArray(normalized.data)) {
        normalized.data = normalized.data.map(item => this.normalizePersonal(item));
      }
      if (Array.isArray(normalized.data?.data)) {
        normalized.data.data = normalized.data.data.map(item => this.normalizePersonal(item));
      }
    }

    if (endpoint === 'Branch') {
      if (Array.isArray(normalized.data)) {
        normalized.data = normalized.data.map(item => this.normalizeBranch(item));
      }
      if (Array.isArray(normalized.data?.data)) {
        normalized.data.data = normalized.data.data.map(item => this.normalizeBranch(item));
      }
    }

    return normalized;
  }

  private normalizeMenu(item: any): any {
    return {
      ...item,
      id_menu_father: item.id_menu_father ?? item.idMenuFather ?? null,
      menu_father: item.menu_father ?? item.parent ?? null
    };
  }

  private normalizeRole(item: any): any {
    return {
      ...item,
      idRole: item.idRole ?? item.id,
      roleName: item.roleName ?? item.name
    };
  }

  private normalizePersonal(item: any): any {
    return {
      ...item,
      idPersonal: item.idPersonal ?? item.id,
      name: item.name ?? [item.firstName ?? item.first_name, item.lastName ?? item.last_name, item.secondLastname ?? item.second_lastname].filter(Boolean).join(' '),
      branchId: item.branchId ?? item.branch_id ?? null,
      branch_id: item.branch_id ?? item.branchId ?? null
    };
  }

  private normalizeBranch(item: any): any {
    return {
      ...item,
      idBranch: item.idBranch ?? item.id,
      branchType: item.branchType ?? item.branch_type ?? 'CENTRO_COMERCIAL',
      branch_type: item.branch_type ?? item.branchType ?? 'CENTRO_COMERCIAL',
      id_department: item.id_department ?? item.idDepartment ?? null,
      id_municipality: item.id_municipality ?? item.idMunicipality ?? null,
      company_id: item.company_id ?? item.companyId ?? null
    };
  }

  private getClientPagedList(endpoint: string, pageIndex: number, pageSize: number): Observable<ApiResponse<any>> {
    return this.getList(endpoint).pipe(map((resp: ApiResponse<any>) => {
      const rows = resp.data ?? [];
      const start = (pageIndex - 1) * pageSize;

      return {
        ...resp,
        data: {
          data: rows.slice(start, start + pageSize),
          meta: {
            pageIndex,
            pageSize,
            totalCount: rows.length,
            totalItemCount: rows.length,
            totalPages: Math.ceil(rows.length / pageSize)
          }
        }
      };
    }));
  }

  private toRolePermissionTree(
    roleResponse: ApiResponse<any>,
    screensResponse: ApiResponse<any>,
    roleId: number,
    menusResponse?: ApiResponse<any>,
    roleMenusResponse?: ApiResponse<any>
  ): ApiResponse<any> {
    const rolePermissions = roleResponse.data?.permissions ?? [];
    const menus = menusResponse?.data ?? [];
    const assignedMenuIds = new Set(
      (roleMenusResponse?.data ?? [])
        .filter((item: any) => item.status === 'E')
        .map((item: any) => item.idMenu)
    );
    const assignedMenuPaths = new Set(
      menus
        .filter((menu: any) => assignedMenuIds.has(menu.id) && menu.id_menu_father !== null)
        .map((menu: any) => menu.path)
    );
    const screens = (screensResponse.data ?? []).filter((screen: any) => assignedMenuPaths.has(screen.routePath));

    const categories = screens.reduce((acc: any[], screen: any) => {
      let category = acc.find(item => item.nameMenu === screen.category);
      if (!category) {
        category = { nameMenu: screen.category, menus: [] };
        acc.push(category);
      }

      category.menus.push({
        nameMenu: screen.title,
        Permissions: screen.permissions.map((permission: any) => {
          const persisted = rolePermissions.find((item: any) => item.name === permission.permissionName);

          return {
            idRole: roleId,
            permissionId: permission.id ?? persisted?.idPermission ?? persisted?.id,
            idRolePermission: `${roleId}-${persisted?.id ?? permission.permissionName}`,
            namePermission: permission.action,
            permissionName: permission.permissionName,
            isCheck: persisted?.isCheck ?? false
          };
        })
      });

      return acc;
    }, []);

    return {
      ...roleResponse,
      data: {
        ...roleResponse.data,
        categories
      }
    };
  }



}
