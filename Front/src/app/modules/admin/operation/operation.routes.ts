import { Routes } from "@angular/router";
import { DonationComponent } from "./donation/donation.component";
import { AssignComponent } from "./assign/assign.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { LoanComponent } from "./loan/loan.component";
import { CalendarComponent } from "./calendar/calendar.component";
import { EnrollfingerComponent } from "./enrollfinger/enrollfinger.component";
import { AppointmentComponent } from "./appointment/appointment.component";
import { CashFlowComponent } from "../catalog/cash-flow/cash-flow.component";
import { PurchaseComponent } from "../catalog/purchase/purchase.component";
import { StockTransferComponent } from "../catalog/stock-transfer/stock-transfer.component";
import { DeliveryRequestComponent } from "../catalog/delivery-request/delivery-request.component";
import { FixedAssetComponent } from "./fixed-asset/fixed-asset.component";
import { CustomerOrderComponent } from "./customer-order/customer-order.component";
import { SaleComponent } from "./sale/sale.component";

export default [
    {path: '', pathMatch : 'full', redirectTo: 'cashsession'},
    {path     : 'cashsession',component: CashFlowComponent},
    {path     : 'purchase',component: PurchaseComponent},
    {path     : 'stock-transfer',component: StockTransferComponent},
    {path     : 'delivery-request',component: DeliveryRequestComponent},
    {path     : 'fixed-asset',component: FixedAssetComponent},
    {path     : 'customer-order',component: CustomerOrderComponent},
    {path     : 'sale',component: SaleComponent},
    {path     : 'donation',component: DonationComponent,},
    {path     : 'assign',component: AssignComponent,},
    {path     : 'inventory',component: InventoryComponent,},
    {path     : 'loan',component: LoanComponent,},
    {path     : 'appointment',component: AppointmentComponent,},
    {path     : 'calendar',component: CalendarComponent,},
    {path     : 'enrollfinger',component: EnrollfingerComponent,}
] as Routes;
