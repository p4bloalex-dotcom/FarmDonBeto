import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { HotToastService } from '@fuse/components/hot-toast';
import { environment } from 'environments/environment';
import { catchError, map, of } from 'rxjs';

const publicPaths = new Set(['home', 'change-password', 'sign-out', 'unlock-session']);
const modulePaths = new Set(['security', 'catalog', 'operation', 'configuration', 'reports', 'audit', 'query']);

const menuPathFromUrl = (url: string): string | null => {
    const segments = url.split('?')[0].split('/').filter(Boolean);
    const menuPath = segments.at(-1)?.toLowerCase();
    return !menuPath || publicPaths.has(menuPath) || modulePaths.has(menuPath) ? null : menuPath;
};

export const PermissionGuard: CanActivateChildFn = (_route, state) => {
    const menuPath = menuPathFromUrl(state.url);
    if (!menuPath) {
        return of(true);
    }

    const http = inject(HttpClient);
    const router = inject(Router);
    const toast = inject(HotToastService);
    const params = new HttpParams().set('menuPath', menuPath).set('action', 'Ver');

    return http.get<any>(`${environment.apiUrl}/security/permissions/access`, { params }).pipe(
        map((response) => {
            if (response?.data?.hasAccess) {
                return true;
            }

            toast.error('No tienes permiso para ver esta pantalla.');
            return router.parseUrl('/home');
        }),
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 403) {
                toast.error(error.error?.message ?? 'No tienes permiso para ver esta pantalla.');
            } else {
                toast.error('No se pudo validar el permiso de acceso.');
            }
            return of(router.parseUrl('/home'));
        })
    );
};
