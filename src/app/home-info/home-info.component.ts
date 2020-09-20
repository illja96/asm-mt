import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BluetoothService } from 'src/services/bluetooth.service';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-info',
  templateUrl: './home-info.component.html',
  styleUrls: ['./home-info.component.css']
})
export class HomeInfoComponent {
  public isBluetoothDeviceConnected: boolean;
  public batteryLevel: number;
  public configuration: Configuration;

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly configurationService: ConfigurationService) {
    this.isBluetoothDeviceConnected = false;
    this.configuration = new Configuration();

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    this.configurationService.getBatteryLevel()
      .pipe(filter((batteryLevel: number) => batteryLevel !== undefined))
      .subscribe((batteryLevel: number) => this.batteryLevel = batteryLevel);

    this.configurationService.getConfiguration()
      .pipe(filter((configuration: Configuration) => configuration !== undefined))
      .subscribe((configuration: Configuration) => this.configuration = configuration);
  }
}
