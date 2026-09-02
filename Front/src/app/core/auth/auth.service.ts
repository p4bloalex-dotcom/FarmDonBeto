import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    resetPassword(id: any): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/User/resetPassword`, id);
    }


    signIn(credentials: { UserName: string; Password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('El usuario ya esta registrado.');
        }

        return this._httpClient.post<ApiResponse<any>>(`${environment.apiUrl}/User/login`, credentials).pipe(
            switchMap((response: any) => {

                if (response.success) {
                    this.accessToken = response.data.token;
                    this._authenticated = true;
                    this._userService.user = response.data.user;
                }
                return of(response);
            })
        );
    }


    signInUsingToken(): Observable<any> {
        return this._httpClient
            .post<ApiResponse<any>>(`${environment.apiUrl}/User/signToken`, this.accessToken)
            .pipe(
                catchError(() =>
                    of(false)
                ),
                switchMap((response: ApiResponse<any>) => {
                    if (response.success) {
                        this.accessToken = response.data.token;
                        this._authenticated = true;
                        this._userService.user = response.data.user;
                        return of(true);
                    }
                    else {
                        return of(false);
                    }
                })
            );
    }


    signOut(): Observable<any> {
        localStorage.removeItem('accessToken');
        this._authenticated = false;
        return of(true);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }
        if (!this.accessToken) {
            return of(false);
        }
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }
        return this.signInUsingToken();
    }


    changePassword(newPassword: string, confirmPassword: string): Observable<any> {
        return this._httpClient.post<any>(`${environment.apiUrl}/User/changePassword`, { password: newPassword, confirmPassword });
    }
}
