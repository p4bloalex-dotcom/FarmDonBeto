import { Routes } from "@angular/router";
import { AuditComponent } from "../security/audit/audit.component";

export default [
    {path: '', pathMatch : 'full', redirectTo: 'audit'},
    {path     : 'audit', component: AuditComponent}
] as Routes;
