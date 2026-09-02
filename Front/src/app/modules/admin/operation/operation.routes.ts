import { Routes } from "@angular/router";
import { DonationComponent } from "./donation/donation.component";
import { AssignComponent } from "./assign/assign.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { LoanComponent } from "./loan/loan.component";
import { CalendarComponent } from "./calendar/calendar.component";
import { EnrollfingerComponent } from "./enrollfinger/enrollfinger.component";
import { AppointmentComponent } from "./appointment/appointment.component";

export default [
    {path     : 'donation',component: DonationComponent,},
    {path     : 'assign',component: AssignComponent,},
    {path     : 'inventory',component: InventoryComponent,},
    {path     : 'loan',component: LoanComponent,},
    {path     : 'appointment',component: AppointmentComponent,},
    {path     : 'calendar',component: CalendarComponent,},
    {path     : 'enrollfinger',component: EnrollfingerComponent,}
] as Routes;
