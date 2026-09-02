import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, takeUntil, throttleTime } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactiveService {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private _authService = inject(AuthService);

  private readonly INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos
  private readonly THROTTLE_TIME = 5000; // Solo actualizar cada 5 segundos
  private destroy$ = new Subject<void>();
  private timeoutId: any;
  private lastActivity = Date.now();

  startWatching(): void {
    this.ngZone.runOutsideAngular(() => {
      const events$ = merge(
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'touchstart'),
        fromEvent(document, 'wheel'),
        fromEvent(document, 'click')
      );

      events$
        .pipe(
          throttleTime(this.THROTTLE_TIME, undefined, {
            leading: true,
            trailing: false
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.lastActivity = Date.now();
        });

      this.startInactivityCheck();
    });
  }

  private startInactivityCheck(): void {
    const checkInterval = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      if (inactiveTime >= this.INACTIVITY_TIME) {
        clearInterval(checkInterval);
        this.ngZone.run(() => {
          this.logout();
        });
      }
    }, 60000); // Check cada minuto

    this.destroy$.subscribe(() => {
      clearInterval(checkInterval);
    });
  }

  private logout(): void {
    localStorage.removeItem('accessToken');
    this._authService.signOut();
    this.router.navigate(['sign-in']);
  }

  stopWatching(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}