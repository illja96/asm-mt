import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BluetoothService } from 'src/services/bluetooth.service'

@Component({
  selector: 'app-home-battery',
  templateUrl: './home-battery.component.html',
  styleUrls: ['./home-battery.component.css']
})
export class HomeBatteryComponent {
  public batteryLevel: number;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe(
        (bleGattServer: BluetoothRemoteGATTServer) => this.updateBatteryLevel(bleGattServer),
        () => this.batteryLevel = undefined);
  }

  private updateBatteryLevel(bleGattServer: BluetoothRemoteGATTServer) {
    const batteryServiceUuid: string = '0000180f-0000-1000-8000-00805f9b34fb';
    const batteryCharacteristicUuid: string = '00002a19-0000-1000-8000-00805f9b34fb';

    bleGattServer.getPrimaryService(batteryServiceUuid)
      .then((bleGattService: BluetoothRemoteGATTService) => bleGattService.getCharacteristic(batteryCharacteristicUuid))
      .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
      .then((bleGattCharacteristicValue: DataView) => this.batteryLevel = bleGattCharacteristicValue.getUint8(0))
      .catch(() => this.batteryLevel = undefined);

    bleGattServer.getPrimaryService(batteryServiceUuid)
      .then((bleGattService: BluetoothRemoteGATTService) => bleGattService.getCharacteristic(batteryCharacteristicUuid))
      .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.startNotifications())
      .then((bleGattCharacteristic: BluetoothRemoteGATTCharacteristic) => bleGattCharacteristic.readValue())
      .then((bleGattCharacteristicValue: DataView) => this.batteryLevel = bleGattCharacteristicValue.getUint8(0))
      .catch(() => this.batteryLevel = undefined);
  }
}
