import { Routes } from "@angular/router";
import { ReportComponent } from "./report/report.component";
import { PersonalComponent } from "../query/personal/personal.component";
import { InventoryHistoryComponent } from "../query/inventory-history/inventory-history.component";
import { ConsolidatedReportComponent } from "./consolidated-report/consolidated-report.component";

export default [
    {path: '', pathMatch : 'full', redirectTo: 'report'},
    {path     : 'report',component: ReportComponent,},
    {path     : 'personalq',component: PersonalComponent,},
    {path     : 'inventoryhistory',component: InventoryHistoryComponent,},
    {path     : 'consolidated-report',component: ConsolidatedReportComponent,},
] as Routes;
