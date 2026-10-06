import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HotToastService } from '@fuse/components/hot-toast';
import { GeneralApiService } from 'app/core/services/general-api.service';
import * as L from 'leaflet';

export interface LocationMapSelection {
  latitude: number;
  longitude: number;
  address?: any;
}

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.scss'
})
export class LocationMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() address: any = null;
  @Input() height = 220;
  @Input() title = 'Ubicacion';
  @Input() compact = true;
  @Output() locationChange = new EventEmitter<LocationMapSelection>();

  readonly mapId = `location-map-${Math.random().toString(36).slice(2)}`;
  resolvedAddress: any = null;
  isResolving = false;
  private map?: L.Map;
  private marker?: L.Marker;
  private initialized = false;

  constructor(private _api: GeneralApiService, private _toast: HotToastService) { }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;
    if (changes.latitude || changes.longitude) this.renderMarker();
    if (changes.address) this.resolvedAddress = this.address;
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  locateCurrentPosition(): void {
    if (!navigator.geolocation) {
      this._toast.error('El navegador no soporta geolocalizacion.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => this.setLocation(position.coords.latitude, position.coords.longitude, true),
      () => this._toast.error('No se pudo obtener la ubicacion actual.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useLocation(): void {
    if (this.latitude == null || this.longitude == null) {
      this._toast.error('Seleccione una ubicacion en el mapa.');
      return;
    }
    this.locationChange.emit({ latitude: Number(this.latitude), longitude: Number(this.longitude), address: this.resolvedAddress });
  }

  displayAddress(): string {
    const source = this.resolvedAddress || this.address;
    if (!source) return 'Seleccione una ubicacion o geolocalice una direccion.';
    return [source.name, source.locality, source.county, source.region, source.country].filter(Boolean).join(', ') || source.label || 'Ubicacion seleccionada';
  }

  coordinatesLabel(): string {
    if (this.latitude == null || this.longitude == null) return 'Sin coordenadas';
    return `${Number(this.latitude).toFixed(6)}, ${Number(this.longitude).toFixed(6)}`;
  }

  private initMap(): void {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
    const initialLat = Number(this.latitude ?? 14.6349);
    const initialLng = Number(this.longitude ?? -90.5069);
    this.resolvedAddress = this.address;
    this.map = L.map(this.mapId, { zoomControl: true }).setView([initialLat, initialLng], this.latitude && this.longitude ? 15 : 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.map.on('click', event => this.setLocation(event.latlng.lat, event.latlng.lng, true));
    this.renderMarker();
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private renderMarker(): void {
    if (!this.map || this.latitude == null || this.longitude == null) return;
    const point = L.latLng(Number(this.latitude), Number(this.longitude));
    if (!this.marker) {
      this.marker = L.marker(point, { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const position = this.marker?.getLatLng();
        if (position) this.setLocation(position.lat, position.lng, true, false);
      });
    } else {
      this.marker.setLatLng(point);
    }
    this.map.setView(point, Math.max(this.map.getZoom(), 14));
  }

  private setLocation(latitude: number, longitude: number, resolveAddress: boolean, moveMarker = true): void {
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    if (moveMarker) this.renderMarker();
    if (!resolveAddress) {
      this.locationChange.emit({ latitude: this.latitude, longitude: this.longitude, address: this.resolvedAddress });
      return;
    }
    this.isResolving = true;
    this._api.reverseGeocode(this.latitude, this.longitude).subscribe({
      next: response => {
        this.isResolving = false;
        if (response.success) this.resolvedAddress = response.data;
        this.locationChange.emit({ latitude: this.latitude, longitude: this.longitude, address: this.resolvedAddress });
      },
      error: () => {
        this.isResolving = false;
        this.locationChange.emit({ latitude: this.latitude, longitude: this.longitude, address: this.resolvedAddress });
      }
    });
  }
}
