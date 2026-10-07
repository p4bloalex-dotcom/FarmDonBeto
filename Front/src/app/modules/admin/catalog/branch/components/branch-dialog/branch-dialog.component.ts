import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { GeneralApiService } from 'app/core/services/general-api.service';
import { LocationMapDialogComponent } from 'app/shared/location-map/location-map-dialog.component';
import { LocationMapSelection } from 'app/shared/location-map/location-map.component';

@Component({
  selector: 'app-branch-dialog',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule, MatCheckboxModule],
  templateUrl: './branch-dialog.component.html',
  styleUrl: './branch-dialog.component.scss'
})
export class BranchDialogComponent {
  actionDialog: number;
  dataForm: UntypedFormGroup;
  departments: any[] = [];
  municipalities: any[] = [];
  geocodeMatches: any[] = [];
  service = 'Branch';
  branchTypes = [
    { value: 'CENTRO_COMERCIAL', label: 'Centro comercial' },
    { value: 'STAND_GASOLINERA', label: 'Stand en gasolinera' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public _data: any, private _matDialogRef: MatDialogRef<BranchDialogComponent>, private _matDialog: MatDialog, private _formBuilder: UntypedFormBuilder, private _generalApi: GeneralApiService, private _toast: HotToastService) {}

  ngOnInit(): void {
    this.actionDialog = this._data?.action;
    this.dataForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      branchType: ['CENTRO_COMERCIAL', [Validators.required]],
      id_department: [null],
      id_municipality: [null],
      status: ['E', [Validators.required]],
      is_main: [false],
      latitude: [null],
      longitude: [null],
      coverageRadiusKm: [8],
      averageDeliveryMinutes: [25]
    });
    this.loadDepartments();

    if (this._data.action !== 1) {
      this.dataForm.patchValue(this._data.row);
      this.dataForm.get('is_main').patchValue(Number(this._data.row?.isMain ?? this._data.row?.is_main) === 1);
      const departmentId = this._data.row?.id_department ?? this._data.row?.idDepartment;
      if (departmentId) this.onDepartmentSelected(departmentId);
    }
    if (this._data.action === 4) this.dataForm.disable();
  }

  loadDepartments(): void {
    this._generalApi.getList('Department').subscribe({
      next: (resp: ApiResponse<any>) => this.departments = resp.success ? resp.data : [],
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  onDepartmentSelected(event: MatSelectChange | number): void {
    const idData = event instanceof MatSelectChange ? event.value : event;
    this._generalApi.GetById('Municipality', idData).subscribe({
      next: (resp: ApiResponse<any>) => this.municipalities = resp.success ? resp.data : [],
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  geocodeBranchAddress(): void {
    const address = String(this.dataForm.value.address ?? '').trim();
    if (address.length < 5) {
      this._toast.error('Ingrese una direccion para geolocalizar.');
      return;
    }
    this._generalApi.geocodeAddress(address).subscribe({
      next: (resp: ApiResponse<any>) => {
        if (!resp.success) return this._toast.error(resp.error?.detail ?? 'No se pudo geolocalizar la direccion.');
        this.geocodeMatches = resp.data ?? [];
        const first = this.geocodeMatches[0];
        if (!first) return this._toast.error('No se encontraron coordenadas para esa direccion.');
        this.applyGeocode(first);
        this._toast.success('Ubicacion encontrada.');
      },
      error: () => this._toast.error('Error inesperado al geolocalizar.')
    });
  }

  applyGeocode(match: any): void {
    this.dataForm.patchValue({ latitude: match.latitude, longitude: match.longitude, address: match.label || this.dataForm.value.address });
  }

  onMapLocationSelected(selection: LocationMapSelection): void {
    this.dataForm.patchValue({
      latitude: selection.latitude,
      longitude: selection.longitude,
      address: selection.address?.label || this.dataForm.value.address
    });
    if (selection.address) this.geocodeMatches = [selection.address];
  }

  openLocationMapDialog(): void {
    const dialogRef = this._matDialog.open(LocationMapDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Ubicacion de sucursal',
        latitude: this.dataForm.value.latitude,
        longitude: this.dataForm.value.longitude,
        address: this.geocodeMatches[0]
      },
      width: '94vw',
      maxWidth: '1100px'
    });
    dialogRef.afterClosed().subscribe((selection?: LocationMapSelection) => {
      if (selection) this.onMapLocationSelected(selection);
    });
  }

  save(): void {
    if (this.dataForm.invalid) return;
    if (this._data.action === 1) this.create();
    if (this._data.action === 2) this.edit();
    if (this._data.action === 4) this.delete();
  }

  create(): void {
    const payload = { ...this.dataForm.getRawValue(), isMain: this.dataForm.get('is_main').value ? 1 : 0 };
    delete payload.is_main;
    this._generalApi.add(this.service, payload).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this._data.action, ...response.data }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  edit(): void {
    const payload = { ...this.dataForm.getRawValue(), isMain: this.dataForm.get('is_main').value ? 1 : 0 };
    delete payload.is_main;
    const idData = this._data.row?.idBranch;
    this._generalApi.modify(this.service, idData, payload).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this._data.action, idData, ...payload }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  delete(): void {
    const idData = this._data.row?.idBranch;
    this._generalApi.delete(this.service, idData).subscribe({
      next: (response: ApiResponse<any>) => response.success ? this._matDialogRef.close({ idAction: this._data.action, idData }) : this._toast.error(response.error.detail),
      error: () => this._toast.error('Error inesperado. Intenta más tarde.')
    });
  }

  close(): void {
    this._matDialogRef.close();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
