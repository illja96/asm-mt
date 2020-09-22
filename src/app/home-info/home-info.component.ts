import { Component } from '@angular/core';
import { BluetoothService } from 'src/services/bluetooth.service';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';
import { Mode } from 'src/models/mode';

@Component({
  selector: 'app-home-info',
  templateUrl: './home-info.component.html',
  styleUrls: ['./home-info.component.css']
})
export class HomeInfoComponent {
  public isBluetoothDeviceConnected: boolean;
  public batteryLevel: number;
  public configuration: Configuration;

  public get isManualExplosionInitialingAvailable(): boolean {
    if (this.configuration === undefined || this.configuration.Mode === undefined) {
      return false;
    } else {
      return this.configuration.Mode === Mode.Any || this.configuration.Mode === Mode.BleOnly;
    }
  }

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
