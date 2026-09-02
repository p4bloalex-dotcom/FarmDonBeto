import { Routes } from "@angular/router";
import { PersonalComponent } from "./personal/personal.component";
import { InventoryHistoryComponent } from "./inventory-history/inventory-history.component";

export default [

    {path: '', pathMatch : 'full', redirectTo: 'personal'},
    {path     : 'personalq',component: PersonalComponent,},
    {path     : 'inventoryhistory',component: InventoryHistoryComponent,},
] as Routes;
