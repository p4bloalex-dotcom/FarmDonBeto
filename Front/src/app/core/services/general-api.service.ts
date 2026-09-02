import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { environment } from 'environments/environment';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralApiService {
  private _httpClient = inject(HttpClient);
  constructor() { }

  getList(endpoint: string) {
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/list`);
  }

  modify(endpoint: string, id: any, data: any) {
    return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/edit/${id}`, data);
  }

  changeStatus(endpoint: string, id: any, data: any) {
    return this._httpClient.put<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/changeStatus/${id}`, data);
  }

  getPaged(endpoint: string, pageIndex: number, pageSize: number) {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    return this._httpClient.get<any>(`${environment.apiUrl}/${endpoint}/pagination`, { params });
  }

  getPagedQuery(endpoint: string, pageIndex: number, pageSize: number, idData: number) {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('IdData', idData);
    return this._httpClient.get<any>(`${environment.apiUrl}/${endpoint}/pagination`, { params });
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
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/add`, data);
  }

  delete(endpoint: string, id: any): any {
    return this._httpClient.delete<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/delete/${id}`, id);
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
    return this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/find/${id}`, id);
  }

  GetBySearch(endpoint: string, data: any): any {
    return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/${endpoint}/find`, data);
  }


  comboList(endpoints: string[]): any {
    const calls = endpoints.map(ep =>
      this._httpClient.get<ApiResponse<any>>(`${environment.apiUrl}/${ep}/list`).pipe(
        map(resp => {
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



}
