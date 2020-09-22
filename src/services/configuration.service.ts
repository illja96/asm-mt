import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BluetoothService } from './bluetooth.service';
import { BleConstants } from '../constants/ble-constants';
import { Configuration } from '../models/configuration';

@Injectable()
export class ConfigurationService {
  private static batteryLevelSubject: BehaviorSubject<number>;
  private static configurationSubject: BehaviorSubject<Configuration>;
  private static decoder: TextDecoder;

  constructor(private readonly bluetoothService: BluetoothService) {
    if (ConfigurationService.batteryLevelSubject === undefined) {
      ConfigurationService.batteryLevelSubject = new BehaviorSubject<number>(undefined);
    }
    if (ConfigurationService.configurationSubject === undefined) {
      ConfigurationService.configurationSubject = new BehaviorSubject<Configuration>(undefined);
    }
    if (ConfigurationService.decoder === undefined) {
      ConfigurationService.decoder = new TextDecoder('utf-8');
    }

    this.bluetoothService.getDeviceBleGattServer()
      .subscribe((bleGattServer: BluetoothRemoteGATTServer) => {
        if (bleGattServer !== undefined) {
          this.updateConfiguration(bleGattServer);
        } else {
          ConfigurationService.batteryLevelSubject.next(undefined);
          ConfigurationService.configurationSubject.next(undefined);
        }
      });
  }

  public getBatteryLevel(): Observable<number> {
    return ConfigurationService.batteryLevelSubject;
  }

  public getConfiguration(): Observable<Configuration> {
    return ConfigurationService.configurationSubject;
  }

  private async updateConfiguration(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);
    const batteryCharacteristic: BluetoothRemoteGATTCharacteristic = await batteryService.getCharacteristic(BleConstants.BatteryService.Characteristics.BatteryLevel);
    const batteryCharacteristicRawValue: DataView = await batteryCharacteristic.readValue();
    const batteryCharacteristicValue: number = batteryCharacteristicRawValue.getUint8(0);
    ConfigurationService.batteryLevelSubject.next(batteryCharacteristicValue);

    batteryCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const batteryCharacteristicNotificationValue = await this.parseCharacteristicNotificationByteValueAsNumber(event);
      ConfigurationService.batteryLevelSubject.next(batteryCharacteristicNotificationValue);
      return true;
    });
    await batteryCharacteristic.startNotifications();

    const configuration: Configuration = new Configuration();
    const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const versionCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.Version);
    const versionCharacteristicRawValue: DataView = await versionCharacteristic.readValue();
    const versionCharacteristicDecodedValue: string = ConfigurationService.decoder.decode(versionCharacteristicRawValue);
    const versionCharacteristicValue: number = parseInt(versionCharacteristicDecodedValue);
    configuration.Version = versionCharacteristicValue;

    const runtimeInSecCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.RuntimeInSec);
    const runtimeInSecCharacteristicRawValue: DataView = await runtimeInSecCharacteristic.readValue();
    const runtimeInSecCharacteristicDecodedValue: string = ConfigurationService.decoder.decode(runtimeInSecCharacteristicRawValue);
    const runtimeInSecCharacteristicValue: number = parseInt(runtimeInSecCharacteristicDecodedValue);
    configuration.RuntimeInSec = runtimeInSecCharacteristicValue;

    runtimeInSecCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const runtimeInSecCharacteristicNotificationValue = await this.parseCharacteristicNotificationStringValueAsNumber(event);
      configuration.RuntimeInSec = runtimeInSecCharacteristicNotificationValue;
      return true;
    });
    await runtimeInSecCharacteristic.startNotifications();

    const modeCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.Mode);
    const modeCharacteristicRawValue: DataView = await modeCharacteristic.readValue();
    const modeCharacteristicDecodedValue: string = ConfigurationService.decoder.decode(modeCharacteristicRawValue);
    const modeCharacteristicValue: number = parseInt(modeCharacteristicDecodedValue);
    configuration.Mode = modeCharacteristicValue;

    const isExplodedCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.IsExploded);
    const isExplodedCharacteristicRawValue: DataView = await isExplodedCharacteristic.readValue();
    const isExplodedCharacteristicDecodedValue: string = ConfigurationService.decoder.decode(isExplodedCharacteristicRawValue);
    const isExplodedCharacteristicValue: number = parseInt(isExplodedCharacteristicDecodedValue);
    configuration.IsExploded = !!isExplodedCharacteristicValue;

    isExplodedCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const isExplodedCharacteristicNotificationValue = await this.parseCharacteristicNotificationStringValueAsBoolean(event);
      configuration.IsExploded = isExplodedCharacteristicNotificationValue;
      return true;
    });
    await isExplodedCharacteristic.startNotifications();

    const explodeDurationInMsCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.ExplodeDurationInMs);
    const explodeDurationInMsCharacteristicRawValue: DataView = await explodeDurationInMsCharacteristic.readValue();
    const explodeDurationInMsCharacteristicDecodedValue: string = ConfigurationService.decoder.decode(explodeDurationInMsCharacteristicRawValue);
    const explodeDurationInMsCharacteristicValue: number = parseInt(explodeDurationInMsCharacteristicDecodedValue);
    configuration.ExplodeDurationInMs = explodeDurationInMsCharacteristicValue;

    ConfigurationService.configurationSubject.next(configuration);
  }

  private async parseCharacteristicNotificationByteValueAsNumber(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationValue: number = characteristicNotificationRawValue.getUint8(0);

    return characteristicNotificationValue;
  }

  private async parseCharacteristicNotificationStringValueAsBoolean(event: Event): Promise<boolean> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationDecodedValue: string = ConfigurationService.decoder.decode(characteristicNotificationRawValue);
    const characteristicNotificationValue: number = parseInt(characteristicNotificationDecodedValue);

    return !!characteristicNotificationValue;
  }

  private async parseCharacteristicNotificationStringValueAsNumber(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationDecodedValue: string = ConfigurationService.decoder.decode(characteristicNotificationRawValue);
    const characteristicNotificationValue: number = parseInt(characteristicNotificationDecodedValue);

    return characteristicNotificationValue;
  }
}
