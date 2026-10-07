import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LocationMapComponent, LocationMapSelection } from './location-map.component';

export interface LocationMapDialogData {
  title: string;
  latitude: number | null;
  longitude: number | null;
  address?: any;
}

@Component({
  selector: 'app-location-map-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, LocationMapComponent],
  templateUrl: './location-map-dialog.component.html'
})
export class LocationMapDialogComponent {
  selection: LocationMapSelection | null = null;
  isMapAvailable = true;
  fallbackLatitude: number | null = null;
  fallbackLongitude: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LocationMapDialogData,
    private _dialogRef: MatDialogRef<LocationMapDialogComponent>
  ) {
    if (data.latitude != null && data.longitude != null) {
      this.fallbackLatitude = Number(data.latitude);
      this.fallbackLongitude = Number(data.longitude);
      this.selection = { latitude: this.fallbackLatitude, longitude: this.fallbackLongitude, address: data.address };
    }
  }

  onLocationChange(selection: LocationMapSelection): void {
    this.selection = selection;
  }

  onMapAvailabilityChange(isAvailable: boolean): void {
    this.isMapAvailable = isAvailable;
    if (!isAvailable) this.selection = null;
  }

  canApply(): boolean {
    return !!this.selection || (this.fallbackLatitude != null && this.fallbackLongitude != null);
  }

  applySelection(): void {
    if (this.selection) {
      this._dialogRef.close(this.selection);
      return;
    }
    if (this.fallbackLatitude != null && this.fallbackLongitude != null) {
      this._dialogRef.close({ latitude: Number(this.fallbackLatitude), longitude: Number(this.fallbackLongitude), address: this.data.address });
    }
  }
}
