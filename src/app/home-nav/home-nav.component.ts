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

  public onConnectBluetoothClick(): void {
    this.bluetoothService.promptConnectToBluetoothDevice();
  }

  public onDisconnectBluetoothClick(): void {
    if (confirm('Are you sure that you want to disconnect?')) {
      this.bluetoothService.disconnectFromBluetoothDevice();
    }
  }
}
