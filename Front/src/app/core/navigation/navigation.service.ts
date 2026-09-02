import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { environment } from 'environments/environment';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>(`${environment.apiUrl}/Menu/accessMenus`).pipe(
            tap((navigation) => {
                const response = navigation as any;
                this.normalizeLinks(response?.data ?? response);
                this._navigation.next(navigation);
            })
        );
    }

    private normalizeLinks(items: FuseNavigationItem[] | undefined): void {
        if (!items) {
            return;
        }

        for (const item of items) {
            if (item.link) {
                item.link = item.link.toLowerCase();
            }

            this.normalizeLinks(item.children);
        }
    }
}
