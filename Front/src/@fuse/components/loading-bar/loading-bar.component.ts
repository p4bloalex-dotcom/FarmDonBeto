import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { AsyncPipe } from '@angular/common';
import {
    Component,
    inject,
    Input,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseLoadingService } from '@fuse/services/loading';

@Component({
    selector: 'fuse-loading-bar',
    templateUrl: './loading-bar.component.html',
    styleUrls: ['./loading-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'fuseLoadingBar',
    imports: [AsyncPipe, MatProgressBarModule]
})
export class FuseLoadingBarComponent implements OnChanges {
    private _fuseLoadingService = inject(FuseLoadingService);

    @Input() autoMode: boolean = true;
    mode$ = this._fuseLoadingService.mode$;
    progress$ = this._fuseLoadingService.progress$;
    show$ = this._fuseLoadingService.show$;

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        // Auto mode
        if ('autoMode' in changes) {
            // Set the auto mode in the service
            this._fuseLoadingService.setAutoMode(
                coerceBooleanProperty(changes.autoMode.currentValue)
            );
        }
    }

}
