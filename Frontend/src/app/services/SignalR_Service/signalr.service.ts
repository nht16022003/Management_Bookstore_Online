import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface DashboardRealtimeMessage {
  action: string;
  controllerName: string;
  actionName: string;
  description: string;
  userName: string;
  dateString: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  private hubUrl = 'http://localhost:5144/hub/dashboard';

  // Luồng phát dữ liệu khi có tin nhắn mới từ Server
  public dashboardUpdate$ = new Subject<DashboardRealtimeMessage>();
  public isConnected$ = new Subject<boolean>();

  // Khởi động kết nối SignalR
  public startConnection(): void {
    if (this.hubConnection && (this.hubConnection.state === signalR.HubConnectionState.Connected || this.hubConnection.state === signalR.HubConnectionState.Connecting)) {
      console.log('🟢 [SignalR] Đang kết nối hoặc đã kết nối sẵn sàng');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Tự động kết nối lại khi rớt mạng
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('🟢 [SignalR] Đã kết nối thành công tới DashboardHub');
        this.isConnected$.next(true);
        this.registerEvents();
      })
      .catch(err => {
        console.error('🔴 [SignalR] Lỗi kết nối:', err);
        this.isConnected$.next(false);
      });

    this.hubConnection.onreconnecting(() => this.isConnected$.next(false));
    this.hubConnection.onreconnected(() => this.isConnected$.next(true));
  }

  // Lắng nghe sự kiện từ Server (loại bỏ listener cũ trước để tránh duplicate)
  private registerEvents(): void {
    if (!this.hubConnection) return;
    this.hubConnection.off('ReceiveDashboardUpdate');
    this.hubConnection.on('ReceiveDashboardUpdate', (data: DashboardRealtimeMessage) => {
      console.log('⚡ [SignalR Realtime Event]:', data);
      this.dashboardUpdate$.next(data);
    });
  }

  // Đóng kết nối khi thoát
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveDashboardUpdate');
      this.hubConnection.stop().then(() => console.log('⚪ [SignalR] Đã ngắt kết nối'));
    }
  }
}
