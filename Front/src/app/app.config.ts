import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject, LOCALE_ID } from '@angular/core';
// import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    PreloadAllModules,
    provideRouter,
    UrlSerializer,
    withInMemoryScrolling,
    withPreloading,
} from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs)

import { provideFuse } from '@fuse';
import { TranslocoService, provideTransloco } from '@ngneat/transloco';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { LowercaseUrlSerializer } from 'app/core/navigation/lowercase-url-serializer';
import { firstValueFrom } from 'rxjs';
import { HOT_TOAST_CONFIG, HotToastConfig } from '@fuse/components/hot-toast/hot-toast.tokens';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'l',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    timeInput: 'HH:mm',        // 👈 solo hora:minutos
    timeOptionLabel: 'HH:mm',  // 👈 opciones en el dropdown
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),
        { provide: UrlSerializer, useClass: LowercaseUrlSerializer },

        // Material Date Adapter
        // {
        //     provide: DateAdapter,
        //     useClass: LuxonDateAdapter,
        // },
        // {
        //     provide: MAT_DATE_FORMATS,
        //     useValue: {
        //         parse: {
        //             dateInput: 'D',
        //         },
        //         display: {
        //             dateInput: 'DDD',
        //             monthYearLabel: 'LLL yyyy',
        //             dateA11yLabel: 'DD',
        //             monthYearA11yLabel: 'LLLL yyyy',
        //         },
        //     },
        // },
        // { provide: LOCALE_ID, useValue: 'es' },
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es' },

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            fuse: {
                layout: 'futuristic',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-rose',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id: 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id: 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id: 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
        {
            provide: HOT_TOAST_CONFIG,
            useValue: <HotToastConfig>{
                position: 'top-center',
                duration: 4000,
                dismissible: true,
                class: '',   
                style: {}  
            }
        }
    ],
};
