// hot-toast.service.ts
import { Injectable, Inject, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { HOT_TOAST_CONFIG, HotToastConfig } from './hot-toast.tokens';

export interface HotToast {
  id: number;
  type: 'success'|'error'|'info'|'warning'|'loading'|'custom';
  message?: string;
  template?: TemplateRef<any>;
  config: HotToastConfig;
}

@Injectable({ providedIn: 'root' })
export class HotToastService {
  private toasts$ = new Subject<HotToast[]>();
  private list: HotToast[] = [];
  private seq = 0;

  constructor(@Inject(HOT_TOAST_CONFIG) private defaults: HotToastConfig) {}

  onToasts() { return this.toasts$.asObservable(); }

  private build(
    type: HotToast['type'],
    msgOrTpl: string|TemplateRef<any>,
    cfg: HotToastConfig = {}
  ) {
    const toast: HotToast = {
      id: ++this.seq,
      type,
      message: typeof msgOrTpl === 'string' ? msgOrTpl : undefined,
      template: msgOrTpl instanceof TemplateRef ? msgOrTpl : undefined,
      config: { ...this.defaults, ...cfg }
    };
    this.list = [toast, ...this.list];
    this.toasts$.next(this.list);

    // auto-dismiss salvo 'loading'
    const dur = toast.config.duration ?? 0;
    if (dur > 0 && type !== 'loading') {
      setTimeout(() => this.remove(toast.id), dur);
    }
    return toast.id;
  }

  success(m, c?)  { return this.build('success', m, c); }
  error(m, c?)    { return this.build('error',   m, c); }
  info(m, c?)     { return this.build('info',    m, c); }
  warning(m, c?)  { return this.build('warning', m, c); }
  loading(m, c?)  { return this.build('loading', m, { duration: 0, ...c }); }
  custom(m, c)    { return this.build('custom',  m, c); }

  remove(id: number) {
    this.list = this.list.filter(t => t.id !== id);
    this.toasts$.next(this.list);
  }
  clear() {
    this.list = [];
    this.toasts$.next(this.list);
  }
}
