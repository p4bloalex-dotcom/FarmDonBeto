import { Routes } from "@angular/router";
import { RoleComponent } from "./role/role.component";
import { MenuComponent } from "./menu/menu.component";
import { RoleMenuComponent } from "./role-menu/role-menu.component";
import { RoleActionComponent } from "./role-action/role-action.component";
import { UserComponent } from "./user/user.component";

export default [

    {path: '', pathMatch : 'full', redirectTo: 'Role'},
    {path     : 'role',component: RoleComponent,},
    {path     : 'menu',component: MenuComponent,},
    {path     : 'menurol',component: RoleMenuComponent,},
    {path     : 'roleaction', component: RoleActionComponent},
    {path     : 'user', component: UserComponent},
    {path     : 'audit', redirectTo: '/audit/audit', pathMatch: 'full'}
] as Routes;
