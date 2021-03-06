import { Component } from '@angular/core';
import { BluetoothService } from '../../services/bluetooth.service';

@Component({
  selector: 'app-home-nav',
  templateUrl: './home-nav.component.html',
  styleUrls: ['./home-nav.component.css']
})
export class HomeNavComponent {
  public isBluetoothDeviceConnected: boolean;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);
  }

  public async onConnectBluetoothClick(): Promise<void> {
    if (!('Notification' in window)) {
      alert('Your browser doesn\'t support desktop notification. Please, consider using another browser');
    }

    const notificationPermission: NotificationPermission = await Notification.requestPermission();
    switch (notificationPermission) {
      case 'default':
      case 'denied':
        alert('Notifications is required to get explode and battery level status notifications');
        return;
    }

    await this.bluetoothService.promptConnectToBluetoothDevice();
  }

  public onDisconnectBluetoothClick(): void {
    if (confirm('Are you sure that you want to disconnect?')) {
      this.bluetoothService.disconnectFromBluetoothDevice();
    }
  }
}
