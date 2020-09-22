import { Component } from '@angular/core';
import { BluetoothService } from 'src/services/bluetooth.service';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-info-status',
  templateUrl: './home-info-status.component.html',
  styleUrls: ['./home-info-status.component.css']
})
export class HomeInfoStatusComponent {
  public isBluetoothDeviceConnected: boolean;
  public batteryLevel: number;
  public configuration: Configuration;

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly configurationService: ConfigurationService) {
    this.isBluetoothDeviceConnected = false;
    this.batteryLevel = undefined;
    this.configuration = undefined;

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    this.configurationService.getBatteryLevel()
      .subscribe((batteryLevel: number) => this.batteryLevel = batteryLevel);

    this.configurationService.getConfiguration()
      .subscribe((configuration: Configuration) => this.configuration = configuration);
  }
}
