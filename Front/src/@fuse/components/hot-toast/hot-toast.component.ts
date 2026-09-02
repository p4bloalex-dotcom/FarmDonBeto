import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HotToast, HotToastService } from './hot-toast.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-hot-toast',
    imports: [CommonModule, MatIconModule,],
    templateUrl: './hot-toast.component.html',
    styleUrls: ['./hot-toast.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'hotToast'
})
export class HotToastComponent {
  toasts$ = this.svc.onToasts(); 
  //toasts: HotToast[] = [];
  constructor(public svc: HotToastService) {
  }
   trackById(_: number, t: HotToast) { return t.id; }
}
