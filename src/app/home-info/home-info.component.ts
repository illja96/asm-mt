import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BluetoothService } from 'src/services/bluetooth.service';
import { BleConfigurationService } from 'src/services/ble-configuration.service';
import { Configuration } from 'src/models/configuration';
import { Mode } from 'src/models/mode';

@Component({
  selector: 'app-home-info',
  templateUrl: './home-info.component.html',
  styleUrls: ['./home-info.component.css']
})
export class HomeInfoComponent {
  public isBluetoothDeviceConnected: boolean;
  public isExplosionInitiationAvailable: boolean;

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly bleConfigurationService: BleConfigurationService) {
    this.isBluetoothDeviceConnected = false;
    this.isExplosionInitiationAvailable = false;

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    this.bleConfigurationService.getConfiguration()
      .pipe(filter((configuration: Configuration) => configuration !== undefined))
      .subscribe((configuration: Configuration) => this.isExplosionInitiationAvailable = configuration.mode === Mode.Any || configuration.mode === Mode.BleOnly);

    this.bleConfigurationService.getConfiguration()
      .pipe(filter((configuration: Configuration) => configuration === undefined))
      .subscribe(() => this.isExplosionInitiationAvailable = false);
  }
}
