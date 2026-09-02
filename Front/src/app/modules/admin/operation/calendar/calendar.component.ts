import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { HotToastService } from '@fuse/components/hot-toast';
import { Subject, takeUntil } from 'rxjs';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { MatDialog } from '@angular/material/dialog';
import { CalendarDialogComponent } from './components/calendar-dialog/calendar-dialog.component';

// FullCalendarModule.registerPlugins([
//   dayGridPlugin,
//   timeGridPlugin,
//   interactionPlugin,
// ]);

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  constructor(
    private _generalApi: GeneralApiService,
    private _toast: HotToastService,
    private _matDialog: MatDialog,
  ) { }
  private _unsubscribeAll = new Subject<void>()

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    editable: false,
    events: [],
    eventClassNames: (arg) => {
      const name = arg.event.title;
      if (!this.colorMap.has(name)) {
        const color = this.colorPalette[this.colorIndex % this.colorPalette.length];
        this.colorMap.set(name, color);
        this.colorIndex++;
      }
      return this.colorMap.get(name);
    },

    datesSet: (arg) => {
      console.log('Vista actual:', arg.view.type);
      this._generalApi.getPagedQueryForDate('Calendar', arg.end.toISOString(), arg.start.toISOString(),)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (resp: ApiResponse<any>) => {
            if (resp.success) {
                this.calendarOptions.events = resp.data.map((t: any) => ({
                      id: t.id,
                      title: t.title ?? t.name,
                      start: t.start ?? t.dateStart,
                      end: t.end ?? t.dateEnd,
                      extendedProps: { personalAssigned: t.personalAssigned }
                    }));
            } else {
              this._toast.error(resp.error.detail);
            }
          },
          error: (error) => {
            this._toast.error('Error inesperado. Intenta más tarde.');
          }
        });
    },


    eventClick: (info) => {
      const id = info.event.id
      const dialogRef = this._matDialog.open(CalendarDialogComponent, {
        autoFocus: false,
        data: { id, action: 7},
        width: '85vw',
        maxWidth: '1200px',
        height: 'auto',
        disableClose: false,
      });
    }
  }

  private colorPalette: string[][] = [
    ['bg-red-500', 'text-white'],
    ['bg-blue-500', 'text-white'],
    ['bg-green-500', 'text-white'],
    ['bg-yellow-400', 'text-black'],
    ['bg-purple-600', 'text-white'],
    ['bg-pink-500', 'text-white'],
    ['bg-indigo-600', 'text-white'],
    ['bg-gray-500', 'text-white'],
    ['bg-teal-500', 'text-white'],
    ['bg-orange-500', 'text-white'],
    ['bg-cyan-500', 'text-black'],
    ['bg-lime-500', 'text-black']
  ];

  private colorMap = new Map<string, string[]>();
  private colorIndex = 0;


  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
