import { Routes } from "@angular/router";
export default [

    {path: '', pathMatch : 'full', redirectTo: '/reports/personalq'},
    {path     : 'personalq', redirectTo: '/reports/personalq', pathMatch: 'full'},
    {path     : 'inventoryhistory', redirectTo: '/reports/inventoryhistory', pathMatch: 'full'},
] as Routes;
