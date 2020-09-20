import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BluetoothService } from './bluetooth.service';
import { Configuration } from '../models/configuration';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class ConfigurationService {
  private batteryLevelSubject: BehaviorSubject<number>;
  private configurationSubject: BehaviorSubject<Configuration>;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.batteryLevelSubject = new BehaviorSubject<number>(undefined);
    this.configurationSubject = new BehaviorSubject<Configuration>(undefined);

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe((bleGattServer: BluetoothRemoteGATTServer) => this.updateConfiguration(bleGattServer));
  }

  public getBatteryLevel(): Observable<number> {
    return this.batteryLevelSubject;
  }

  public getConfiguration(): Observable<Configuration> {
    return this.configurationSubject;
  }

  private async updateConfiguration(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);
    const batteryCharacteristic: BluetoothRemoteGATTCharacteristic = await batteryService.getCharacteristic(BleConstants.BatteryService.Characteristics.BatteryLevel);
    const batteryCharacteristicRawValue: DataView = await batteryCharacteristic.readValue();
    const batteryCharacteristicValue: number = batteryCharacteristicRawValue.getUint8(0);
    this.batteryLevelSubject.next(batteryCharacteristicValue);

    const batteryCharacteristicNotification = await batteryCharacteristic.startNotifications();
    batteryCharacteristicNotification.addEventListener(characteristicValueChangedEventName, async (event) => {
      const batteryCharacteristicNotificationValue = await this.parseCharacteristicNotificationValueAsNumber(event);
      this.batteryLevelSubject.next(batteryCharacteristicNotificationValue);
    });

    const configuration: Configuration = new Configuration();
    const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const versionCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.Version);
    const versionCharacteristicRawValue: DataView = await versionCharacteristic.readValue();
    const versionCharacteristicValue: number = versionCharacteristicRawValue.getUint8(0);
    configuration.Version = versionCharacteristicValue;

    const runtimeInSecCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.RuntimeInSec);
    const runtimeInSecCharacteristicRawValue: DataView = await runtimeInSecCharacteristic.readValue();
    const runtimeInSecCharacteristicValue: number = runtimeInSecCharacteristicRawValue.getUint8(0);
    configuration.RuntimeInSec = runtimeInSecCharacteristicValue;

    const runtimeInSecCharacteristicNotification = await runtimeInSecCharacteristic.startNotifications();
    runtimeInSecCharacteristicNotification.addEventListener(characteristicValueChangedEventName, async (event) => {
      const runtimeInSecCharacteristicNotificationValue = await this.parseCharacteristicNotificationValueAsNumber(event);
      configuration.RuntimeInSec = runtimeInSecCharacteristicNotificationValue;
    });

    const modeCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.Mode);
    const modeCharacteristicRawValue: DataView = await modeCharacteristic.readValue();
    const modeCharacteristicValue: number = modeCharacteristicRawValue.getUint8(0);
    configuration.Mode = modeCharacteristicValue;

    const isExplodedCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.IsExploded);
    const isExplodedCharacteristicRawValue: DataView = await isExplodedCharacteristic.readValue();
    const isExplodedCharacteristicValue: number = isExplodedCharacteristicRawValue.getUint8(0);
    configuration.IsExploded = !!isExplodedCharacteristicValue;

    const isExplodedCharacteristicNotification = await isExplodedCharacteristic.startNotifications();
    isExplodedCharacteristicNotification.addEventListener(characteristicValueChangedEventName, async (event) => {
      const isExplodedCharacteristicNotificationValue = await this.parseCharacteristicNotificationValueAsNumber(event);
      configuration.IsExploded = !!isExplodedCharacteristicNotificationValue;
    });

    const explodeDurationInMsCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.ExplodeDurationInMs);
    const explodeDurationInMsCharacteristicRawValue: DataView = await explodeDurationInMsCharacteristic.readValue();
    const explodeDurationInMsCharacteristicValue: number = explodeDurationInMsCharacteristicRawValue.getUint8(0);
    configuration.ExplodeDurationInMs = explodeDurationInMsCharacteristicValue;

    this.configurationSubject.next(configuration);
  }

  private async parseCharacteristicNotificationValueAsNumber(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    return characteristicNotificationRawValue.getUint8(0);
  }
}
