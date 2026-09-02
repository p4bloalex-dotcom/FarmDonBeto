import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;

  startConnection(): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/notificationHub';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('accessToken') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(() => null);
  }

  onAppointmentChanged(callback: (data: any) => void): void {
    this.hubConnection?.off('AppointmentChanged');
    this.hubConnection?.on('AppointmentChanged', callback);
  }

  stopConnection(): void {
    this.hubConnection?.stop();
  }
}
