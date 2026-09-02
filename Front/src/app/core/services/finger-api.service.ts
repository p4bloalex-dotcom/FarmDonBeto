import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { environment } from 'environments/environment';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FingerApiService {
    private _httpClient = inject(HttpClient);
    baseURL = 'http://localhost:5000/api/huellas';
    constructor() { }

    captureFingerprint() {
        return this._httpClient.post<any>(`${this.baseURL}/capture`, {});
    }

    CancelCapture() {
        return this._httpClient.post<any>(`${this.baseURL}/cancel`, {});
    }

    checkStatus() {
        return this._httpClient.get<any>(`${this.baseURL}/status`).pipe(
            catchError(() => of({
                success: false,
                message: 'Servicio local no disponible'
            } as unknown as ApiResponse<any>))
        );
    }

    getDevices() {
        return this._httpClient.get<any>(`${this.baseURL}/devices`).pipe(
            catchError(() => of({
                success: false,
                message: 'Error al obtener dispositivos'
            } as unknown as ApiResponse<any>))
        );
    }
}