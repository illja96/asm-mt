import { Component } from '@angular/core';
import { BluetoothService } from 'src/services/bluetooth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isBluetoothDeviceConnected: boolean;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.isBluetoothDeviceConnected = false;
    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);
  }
}
