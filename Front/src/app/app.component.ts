import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HotToastComponent } from '@fuse/components/hot-toast';
import { AuthService } from './core/auth/auth.service';
import { InactiveService } from './core/services/inactive.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet, HotToastComponent]
})
export class AppComponent {

    private _authService = inject(AuthService);
    private router = inject(Router);
    private _inactivityService = inject(InactiveService);

    constructor() {
        this._authService.check()
            .pipe(takeUntilDestroyed())
            .subscribe((authenticated) => {
                authenticated
                    ? this._inactivityService.startWatching()
                    : this._inactivityService.stopWatching();
            });

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                switchMap(() => this._authService.check()),
                takeUntilDestroyed()
            )
            .subscribe((authenticated) => {
                authenticated
                    ? this._inactivityService.startWatching()
                    : this._inactivityService.stopWatching();
            });
    }

    // private isAuthenticated(): boolean {
    //     // Implementa tu lógica de verificación de autenticación
    //     return !!localStorage.getItem('authToken');
    // }

    @HostListener('window:unload')
    clearSession(): void {
        this._authService.signOut();
    }
}
