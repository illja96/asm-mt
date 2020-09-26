import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BleConstants } from '../constants/ble-constants';
import { BleCharacteristicReaderService } from './ble-characteristic-reader.service';
import { BluetoothService } from './bluetooth.service';

@Injectable()
export class BleBatteryService {
  private batteryLevelSubject: BehaviorSubject<number>;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.batteryLevelSubject = new BehaviorSubject<number>(undefined);

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe(async (bleGattServer: BluetoothRemoteGATTServer) => {
        await this.updateBatteryLevelSubject(bleGattServer);
        await this.subscribeToBatteryLevelNotifications(bleGattServer);
      });

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer === undefined))
      .subscribe(() => this.batteryLevelSubject.next(undefined));
  }

  public getBatteryLevel(): Observable<number> {
    return this.batteryLevelSubject;
  }

  private async updateBatteryLevelSubject(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);
    const batteryCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicByteValue(batteryService, BleConstants.BatteryService.Characteristics.BatteryLevel);
    this.batteryLevelSubject.next(batteryCharacteristicValue);
  }

  private async subscribeToBatteryLevelNotifications(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);
    const batteryCharacteristic: BluetoothRemoteGATTCharacteristic = await batteryService.getCharacteristic(BleConstants.BatteryService.Characteristics.BatteryLevel);
    batteryCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const batteryCharacteristicValue: number = await BleCharacteristicReaderService.readNotificationEventByteValue(event);
      this.batteryLevelSubject.next(batteryCharacteristicValue);
    });
    await batteryCharacteristic.startNotifications();
  }
}
