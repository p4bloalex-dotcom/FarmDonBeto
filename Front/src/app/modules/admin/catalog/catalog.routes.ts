import { Routes } from "@angular/router";
import { CompanyComponent } from "./company/company.component";
import { TypePersonalComponent } from "./type-personal/type-personal.component";
import { PositionPersonalComponent } from "./position-personal/position-personal.component";
import { PersonaldoRequeComponent } from "./personaldo-reque/personaldo-reque.component";
import { TypeDocumentComponent } from "./type-document/type-document.component";
import { PersonalComponent } from "./personal/personal.component";
import { TypeDonationComponent } from "./type-donation/type-donation.component";
import { TypeDonorComponent } from "./type-donor/type-donor.component";
import { CategoryItemComponent } from "./category-item/category-item.component";
import { TypeEntryComponent } from "./type-entry/type-entry.component";
import { UnitItemComponent } from "./unit-item/unit-item.component";
import { ItemExittypeComponent } from "./item-exittype/item-exittype.component";
import { ShiftPatternComponent } from "./shift-pattern/shift-pattern.component";
import { TypeFingerComponent } from "./type-finger/type-finger.component";
import { ServiceComponent } from "./service/service.component";
import { BranchComponent } from "./branch/branch.component";
import { PharmacyCatalogComponent } from "./pharmacy-catalog/pharmacy-catalog.component";
import { pharmacyCatalogConfigs } from "./pharmacy-catalog/pharmacy-catalog.config";

export default [

    {path: '', pathMatch : 'full', redirectTo: 'company'},
    {path     : 'company',component: CompanyComponent,},
    {path     : 'typepersonal',component: TypePersonalComponent,},
    {path     : 'positionpersonal',component: PositionPersonalComponent,},
    {path     : 'personaldocumentsrequeriment',component: PersonaldoRequeComponent,},
    {path     : 'typedocument',component: TypeDocumentComponent,},
    {path     : 'personal',component: PersonalComponent,},
    {path     : 'donationtype',component: TypeDonationComponent,},
    {path     : 'donorstype',component: TypeDonorComponent,},
    {path     : 'inventarycategory',component: CategoryItemComponent,},
    {path     : 'inventoryentrytype',component: TypeEntryComponent,},
    {path     : 'unititem',component: UnitItemComponent,},
    {path     : 'itemexittype',component: ItemExittypeComponent,},
    {path     : 'shiftpattern',component: ShiftPatternComponent,},
    {path     : 'fingertype',component: TypeFingerComponent,},
    {path     : 'service',component: ServiceComponent,},
    {path     : 'branch',component: BranchComponent,},
    {path     : 'medicinecategory',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.medicineCategory }},
    {path     : 'medicinelaboratory',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.medicineLaboratory }},
    {path     : 'medicinepresentation',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.medicinePresentation }},
    {path     : 'medicine',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.medicine }},
    {path     : 'supplier',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.supplier }},
{path     : 'suppliermedicine',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.supplierMedicine }},
    {path     : 'unitmeasurement',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.unitMeasurement }},
    {path     : 'cashmovementtype',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.cashMovementType }},
    {path     : 'cashregister',component: PharmacyCatalogComponent, data: { catalogConfig: pharmacyCatalogConfigs.cashRegister }},
    {path     : 'cashsession', redirectTo: '/operation/cashsession', pathMatch: 'full'},
    {path     : 'purchase', redirectTo: '/operation/purchase', pathMatch: 'full'},
    {path     : 'stock-transfer', redirectTo: '/operation/stock-transfer', pathMatch: 'full'},
    {path     : 'delivery-request', redirectTo: '/operation/delivery-request', pathMatch: 'full'},
] as Routes;
