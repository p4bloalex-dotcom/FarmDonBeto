// hot-toast.service.ts
import { Injectable, Inject, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HOT_TOAST_CONFIG, HotToastConfig } from './hot-toast.tokens';

export interface HotToast {
  id: number;
  type: 'success'|'error'|'info'|'warning'|'loading'|'custom';
  message?: string;
  template?: TemplateRef<any>;
  config: HotToastConfig;
  createdAt: number;
  remaining: number;
}

@Injectable({ providedIn: 'root' })
export class HotToastService {
  private toasts$ = new BehaviorSubject<HotToast[]>([]);
  private list: HotToast[] = [];
  private timers = new Map<number, ReturnType<typeof setTimeout>>();
  private seq = 0;

  constructor(@Inject(HOT_TOAST_CONFIG) private defaults: HotToastConfig) {}

  onToasts() { return this.toasts$.asObservable(); }

  private build(
    type: HotToast['type'],
    msgOrTpl: string|TemplateRef<any>,
    cfg: HotToastConfig = {}
  ) {
    const message = typeof msgOrTpl === 'string' ? this.normalizeMessage(msgOrTpl) : undefined;
    const duplicated = message ? this.list.find(t => t.type === type && t.message === message) : null;
    if (duplicated) {
      this.restartTimer(duplicated);
      return duplicated.id;
    }

    const config = { ...this.defaults, ...cfg };
    const toast: HotToast = {
      id: ++this.seq,
      type,
      message,
      template: msgOrTpl instanceof TemplateRef ? msgOrTpl : undefined,
      config,
      createdAt: Date.now(),
      remaining: config.duration ?? 0
    };
    this.list = [toast, ...this.list].slice(0, 4);
    this.emit();

    this.startTimer(toast);
    return toast.id;
  }

  success(m, c?)  { return this.build('success', m, c); }
  error(m, c?)    { return this.build('error',   m, c); }
  info(m, c?)     { return this.build('info',    m, c); }
  warning(m, c?)  { return this.build('warning', m, c); }
  loading(m, c?)  { return this.build('loading', m, { duration: 0, ...c }); }
  custom(m, c)    { return this.build('custom',  m, c); }

  remove(id: number) {
    this.clearTimer(id);
    this.list = this.list.filter(t => t.id !== id);
    this.emit();
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.list = [];
    this.emit();
  }

  pause(id: number) {
    const toast = this.list.find(t => t.id === id);
    if (!toast || toast.type === 'loading' || !this.timers.has(id)) {
      return;
    }

    toast.remaining = Math.max(0, toast.remaining - (Date.now() - toast.createdAt));
    this.clearTimer(id);
  }

  resume(id: number) {
    const toast = this.list.find(t => t.id === id);
    if (!toast || toast.type === 'loading') {
      return;
    }

    this.startTimer(toast);
  }

  private startTimer(toast: HotToast) {
    if (toast.type === 'loading' || !toast.remaining || toast.remaining <= 0) {
      return;
    }

    toast.createdAt = Date.now();
    this.clearTimer(toast.id);
    this.timers.set(toast.id, setTimeout(() => this.remove(toast.id), toast.remaining));
  }

  private restartTimer(toast: HotToast) {
    toast.remaining = toast.config.duration ?? 0;
    this.startTimer(toast);
  }

  private clearTimer(id: number) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private emit() {
    this.toasts$.next([...this.list]);
  }

  private normalizeMessage(message: string) {
    return message.trim().replace(/\s+/g, ' ') || 'Operacion no disponible.';
  }
}
