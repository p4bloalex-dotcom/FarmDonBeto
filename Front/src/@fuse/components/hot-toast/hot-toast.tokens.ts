// hot-toast.tokens.ts
import { InjectionToken } from '@angular/core';

export interface HotToastConfig {
  position?: 
    | 'top-left' | 'top-center' | 'top-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration?: number;
  dismissible?: boolean;
  style?: Partial<CSSStyleDeclaration>;
  class?: string;
}

export const HOT_TOAST_CONFIG = new InjectionToken<HotToastConfig>(
  'HOT_TOAST_CONFIG'
);



// export const DEFAULT_HOT_TOAST_CONFIG: HotToastConfig = {
//   position: 'top-right',
//   duration: 3000,
//   dismissible: true,
//   style: {},
//   class: ''
// };