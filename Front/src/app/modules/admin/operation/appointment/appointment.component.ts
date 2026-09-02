import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { MatDialog } from '@angular/material/dialog';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { ActionType } from 'app/core/Models/action.type';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { SignalrService } from 'app/core/services/signalr.service';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentDialogComponent } from './components/appointment-dialog/appointment-dialog.component';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss'
})
export class AppointmentComponent implements OnInit, OnDestroy {
  @ViewChild(FullCalendarComponent) calendarComponent?: FullCalendarComponent;

  private _unsubscribeAll = new Subject<void>();
  private startDate: string;
  private endDate: string;
  service: string = 'Appointment';
  appointments: any[] = [];
  currentPeriodTitle = '';

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
    private _signalrService: SignalrService,
  ) { }

  ngOnInit(): void {
    this._signalrService.startConnection();
    this._signalrService.onAppointmentChanged(() => this.loadAppointments());
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: '100%',
    expandRows: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Dia'
    },
    selectable: true,
    editable: false,
    nowIndicator: true,
    events: [],
    dateClick: (info) => this.openDialog({ start_at: info.dateStr }, ActionType.Create),
    datesSet: (arg) => {
      this.startDate = arg.start.toISOString();
      this.endDate = arg.end.toISOString();
      this.currentPeriodTitle = arg.view.title;
      this.loadAppointments();
    },
    eventClick: (info) => {
      this._generalApi.GetById(this.service, info.event.id)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (resp: ApiResponse<any>) => {
            if (resp.success) {
              this.openDialog(resp.data, ActionType.Edit);
            } else {
              this._toast.error(resp.error?.detail || 'Error al obtener la cita');
            }
          },
          error: () => this._toast.error('Error inesperado. Intenta más tarde.')
        });
    },
    eventClassNames: (arg) => {
      const status = arg.event.extendedProps?.status;
      if (status === 'D') return ['bg-red-500', 'text-white'];
      if (status === 'P') return ['bg-yellow-400', 'text-black'];
      if (status === 'F') return ['bg-green-600', 'text-white'];
      return ['bg-blue-600', 'text-white'];
    }
  }

  loadAppointments(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this._generalApi.getPagedQueryForDate(this.service, this.endDate, this.startDate)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.calendarOptions.events = resp.data.map((item: any) => ({
              id: item.id,
              title: item.title ?? item.service ?? item.source,
              start: item.start ?? item.start_at,
              end: item.end ?? item.end_at,
              extendedProps: item
            }));
            this.appointments = [...resp.data].sort((a: any, b: any) => {
              const firstDate = new Date(a.start ?? a.start_at).getTime();
              const secondDate = new Date(b.start ?? b.start_at).getTime();
              return firstDate - secondDate;
            });
          } else {
            this._toast.error(resp.error?.detail || 'Error al obtener las citas');
          }
        },
        error: () => this._toast.error('Error inesperado. Intenta más tarde.')
      });
  }

  moveCalendar(action: 'prev' | 'next' | 'today'): void {
    const calendarApi = this.calendarComponent?.getApi();
    if (!calendarApi) return;

    if (action === 'prev') calendarApi.prev();
    if (action === 'next') calendarApi.next();
    if (action === 'today') calendarApi.today();
  }

  openAppointment(appointment: any): void {
    this._generalApi.GetById(this.service, appointment.id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (resp: ApiResponse<any>) => {
          if (resp.success) {
            this.openDialog(resp.data, ActionType.Edit);
          } else {
            this._toast.error(resp.error?.detail || 'Error al obtener la cita');
          }
        },
        error: () => this._toast.error('Error inesperado. Intenta más tarde.')
      });
  }

  formatDate(value: any): string {
    if (!value) return '';

    return new Intl.DateTimeFormat('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(new Date(value));
  }

  formatTime(value: any): string {
    if (!value) return '';

    return new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  getAppointmentTitle(appointment: any): string {
    return appointment.title ?? appointment.service ?? appointment.source ?? 'Cita';
  }

  getStatusLabel(status: string): string {
    if (status === 'D') return 'Cancelada';
    if (status === 'P') return 'Pendiente';
    if (status === 'F') return 'Finalizada';
    return 'Activa';
  }

  getStatusClass(status: string): string {
    const baseClass = 'shrink-0 rounded-full px-3 py-1 text-xs font-semibold';
    if (status === 'D') return `${baseClass} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200`;
    if (status === 'P') return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100`;
    if (status === 'F') return `${baseClass} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-100`;
    return `${baseClass} bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100`;
  }

  openDialog(row: any, action: number): void {
    const dialogRef = this._matDialog.open(AppointmentDialogComponent, {
      autoFocus: false,
      data: { row, action },
      width: '90vw',
      maxWidth: '900px',
      height: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadAppointments();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._signalrService.stopConnection();
  }
}
