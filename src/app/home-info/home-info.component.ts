import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BluetoothService } from 'src/services/bluetooth.service';
import { BleConstants } from 'src/constants/ble-constants';
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

  constructor(private readonly bluetoothService: BluetoothService) {
    this.isBluetoothDeviceConnected = false;
    this.configuration = new Configuration();

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe((bleGattServer: BluetoothRemoteGATTServer) => {
        this.updateBatteryLevel(bleGattServer);
        this.updateConfiguration(bleGattServer);
      });
  }

  private updateBatteryLevel(bleGattServer: BluetoothRemoteGATTServer): void {
    bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID)
      .then((bleGattService: BluetoothRemoteGATTService) => {
        bleGattService.getCharacteristic(BleConstants.BatteryService.Characteristics.BatteryLevel)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.batteryLevel = bleGattCharacteristicValue.getUint8(0));
      });
  }

  private updateConfiguration(bleGattServer: BluetoothRemoteGATTServer): void {
    bleGattServer.getPrimaryService(BleConstants.CustomService.UUID)
      .then((bleGattService: BluetoothRemoteGATTService) => {
        bleGattService.getCharacteristic(BleConstants.CustomService.Characteristics.Version)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.configuration.Version = bleGattCharacteristicValue.getUint8(0));

        bleGattService.getCharacteristic(BleConstants.CustomService.Characteristics.RuntimeInSec)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.configuration.RuntimeInSec = bleGattCharacteristicValue.getUint8(0));

        bleGattService.getCharacteristic(BleConstants.CustomService.Characteristics.Mode)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.configuration.Mode = bleGattCharacteristicValue.getUint8(0));

        bleGattService.getCharacteristic(BleConstants.CustomService.Characteristics.IsExploded)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.configuration.IsExploded = !!bleGattCharacteristicValue.getUint8(0));

        bleGattService.getCharacteristic(BleConstants.CustomService.Characteristics.ExplodeDurationInMs)
          .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
          .then((bleGattCharacteristicValue: DataView) => this.configuration.ExplodeDurationInMs = bleGattCharacteristicValue.getUint8(0));
      });
  }
}
