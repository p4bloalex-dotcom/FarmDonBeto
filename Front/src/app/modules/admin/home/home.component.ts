import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HotToastService } from '@fuse/components/hot-toast';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-home',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    summary: any = null;
    isLoading = false;
    private _unsubscribeAll = new Subject<void>();

    constructor(private _api: GeneralApiService, private _toast: HotToastService) { }

    ngOnInit(): void {
        this.loadSummary();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadSummary(): void {
        this.isLoading = true;
        this._api.getDashboardSummary().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: response => {
                this.isLoading = false;
                if (!response.success) {
                    this._toast.error(response.error?.detail ?? 'No se pudo cargar el tablero.');
                    return;
                }
                this.summary = {
                    ...response.data,
                    branchStatus: Array.isArray(response.data?.branchStatus) ? response.data.branchStatus : []
                };
            },
            error: () => {
                this.isLoading = false;
                this._toast.error('Error inesperado al cargar el tablero.');
            }
        });
    }

    money(value: any): string {
        return `Q ${Number(value ?? 0).toFixed(2)}`;
    }

    branchTypeLabel(value: string): string {
        return value === 'STAND_GASOLINERA' ? 'Stand gasolinera' : 'Centro comercial';
    }
}
