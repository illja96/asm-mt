import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BluetoothService } from './bluetooth.service';
import { BleConstants } from '../constants/ble-constants';
import { Configuration } from '../models/configuration';
import { filter, take } from 'rxjs/operators';

@Injectable()
export class ConfigurationService {
  private static batteryLevelSubject: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  private static configurationSubject: BehaviorSubject<Configuration> = new BehaviorSubject<Configuration>(undefined);
  private static decoder: TextDecoder = new TextDecoder('utf-8');
  private static encoder: TextEncoder = new TextEncoder();

  constructor(private readonly bluetoothService: BluetoothService) {
    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe(async (bleGattServer: BluetoothRemoteGATTServer) => {
        this.updateBatteryLevelSubject(bleGattServer);
        this.subscribeToBatteryLevelChangesViaNotifications(bleGattServer);

        const configuration: Configuration = await this.updateConfigurationSubject(bleGattServer);
        this.subscribeToConfigurationChangesViaNotifications(bleGattServer, configuration);
      });

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer === undefined))
      .subscribe(() => {
        ConfigurationService.batteryLevelSubject.next(undefined);
        ConfigurationService.configurationSubject.next(undefined);
      });
  }

  public getBatteryLevel(): Observable<number> {
    return ConfigurationService.batteryLevelSubject;
  }

  public getConfiguration(): Observable<Configuration> {
    return ConfigurationService.configurationSubject;
  }

  public setConfiguration(configuration: Configuration): void {
    const modeValue: string = (configuration.mode as number).toString();
    const modeCharacteristicEncodedValue: Uint8Array = ConfigurationService.encoder.encode(modeValue);

    const explodeDurationInMsCharacteristicValue: string = configuration.explodeDurationInMs.toString();
    const explodeDurationInMsCharacteristicEncodedValue: Uint8Array = ConfigurationService.encoder.encode(explodeDurationInMsCharacteristicValue);

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(
        take(1))
      .subscribe(async (bleGattServer: BluetoothRemoteGATTServer) => {
        const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

        const modeCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.Mode);
        await modeCharacteristic.writeValue(modeCharacteristicEncodedValue);

        const explodeDurationInMsCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.ExplodeDurationInMs);
        await explodeDurationInMsCharacteristic.writeValue(explodeDurationInMsCharacteristicEncodedValue);
      });
  }

  public initiateExplosionViaBle(): void {
    this.bluetoothService.getDeviceBleGattServer()
      .pipe(take(1))
      .subscribe(async (bleGattServer: BluetoothRemoteGATTServer) => {
        const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

        const isForceExplodeViaBleInitiatedCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.IsForceExplodeViaBleInitiated);
        const isForceExplodeViaBleInitiatedCharacteristicValue: string = '1';
        const isForceExplodeViaBleInitiatedCharacteristicEncodedValue: Uint8Array = ConfigurationService.encoder.encode(isForceExplodeViaBleInitiatedCharacteristicValue);
        await isForceExplodeViaBleInitiatedCharacteristic.writeValue(isForceExplodeViaBleInitiatedCharacteristicEncodedValue);
      });
  }

  private async updateBatteryLevelSubject(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);
    const batteryCharacteristicValue: number = await this.parseCharacteristicByteValueAsNumber(batteryService, BleConstants.BatteryService.Characteristics.BatteryLevel);
    ConfigurationService.batteryLevelSubject.next(batteryCharacteristicValue);
  }

  private async subscribeToBatteryLevelChangesViaNotifications(bleGattServer: BluetoothRemoteGATTServer): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const batteryService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.BatteryService.UUID);

    const batteryCharacteristic: BluetoothRemoteGATTCharacteristic = await batteryService.getCharacteristic(BleConstants.BatteryService.Characteristics.BatteryLevel);
    batteryCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const batteryCharacteristicValue: number = await this.parseCharacteristicNotificationByteValueAsNumber(event);
      ConfigurationService.batteryLevelSubject.next(batteryCharacteristicValue);
    });
    await batteryCharacteristic.startNotifications();
  }

  private async updateConfigurationSubject(bleGattServer: BluetoothRemoteGATTServer): Promise<Configuration> {
    const configuration: Configuration = new Configuration();
    const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const versionCharacteristicValue: number = await this.parseCharacteristicStringAsNumber(customService, BleConstants.CustomService.Characteristics.Version);
    configuration.version = versionCharacteristicValue;

    const runtimeInSecCharacteristicValue: number = await this.parseCharacteristicStringAsNumber(customService, BleConstants.CustomService.Characteristics.RuntimeInSec);
    configuration.runtimeInSec = runtimeInSecCharacteristicValue;

    const modeCharacteristicValue: number = await this.parseCharacteristicStringAsNumber(customService, BleConstants.CustomService.Characteristics.Mode);
    configuration.mode = modeCharacteristicValue;

    const isExplodedCharacteristicValue: number = await this.parseCharacteristicStringAsNumber(customService, BleConstants.CustomService.Characteristics.IsExploded);
    configuration.isExploded = !!isExplodedCharacteristicValue;

    const explodeDurationInMsCharacteristicValue: number = await this.parseCharacteristicStringAsNumber(customService, BleConstants.CustomService.Characteristics.ExplodeDurationInMs);
    configuration.explodeDurationInMs = explodeDurationInMsCharacteristicValue;

    ConfigurationService.configurationSubject.next(configuration);

    return configuration;
  }

  private async subscribeToConfigurationChangesViaNotifications(bleGattServer: BluetoothRemoteGATTServer, configuration: Configuration): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const customService: BluetoothRemoteGATTService = await bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const runtimeInSecCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.RuntimeInSec);
    runtimeInSecCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const runtimeInSecCharacteristicValue: number = await this.parseCharacteristicNotificatioStringValueAsNumber(event);
      configuration.runtimeInSec = runtimeInSecCharacteristicValue;
    });
    await runtimeInSecCharacteristic.startNotifications();

    const isExplodedCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.IsExploded);
    isExplodedCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const isExplodedCharacteristicNotificationValue: number = await this.parseCharacteristicNotificatioStringValueAsNumber(event);
      configuration.isExploded = !!isExplodedCharacteristicNotificationValue;
    });
    await isExplodedCharacteristic.startNotifications();
  }

  private async parseCharacteristicNotificationByteValueAsNumber(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationValue: number = characteristicNotificationRawValue.getUint8(0);

    return characteristicNotificationValue;
  }

  private async parseCharacteristicNotificatioStringValueAsNumber(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationDecodedValue: string = ConfigurationService.decoder.decode(characteristicNotificationRawValue);
    const characteristicNotificationValue: number = parseInt(characteristicNotificationDecodedValue);

    return characteristicNotificationValue;
  }

  private async parseCharacteristicByteValueAsNumber(service: BluetoothRemoteGATTService, characteristicUuid: string): Promise<number> {
    const characteristic: BluetoothRemoteGATTCharacteristic = await service.getCharacteristic(characteristicUuid);
    const characteristicRawValue: DataView = await characteristic.readValue();
    const characteristicValue: number = characteristicRawValue.getUint8(0);

    return characteristicValue;
  }

  private async parseCharacteristicStringAsNumber(service: BluetoothRemoteGATTService, characteristicUuid: string): Promise<number> {
    const characteristic: BluetoothRemoteGATTCharacteristic = await service.getCharacteristic(characteristicUuid);
    const characteristicRawValue: DataView = await characteristic.readValue();
    const characteristicDecodedValue: string = ConfigurationService.decoder.decode(characteristicRawValue);
    const characteristicValue: number = parseInt(characteristicDecodedValue);

    return characteristicValue;
  }
}
