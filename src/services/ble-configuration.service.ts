import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BleCharacteristicReaderService } from './ble-characteristic-reader.service';
import { BleCharacteristicWriterService } from './ble-characteristic-writer.service';
import { BluetoothService } from './bluetooth.service';
import { Configuration } from '../models/configuration';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class BleConfigurationService {
  private bleGattServer: BluetoothRemoteGATTServer;
  private configuration: Configuration;
  private configurationSubject: BehaviorSubject<Configuration>;

  constructor(private readonly bluetoothService: BluetoothService) {
    this.configuration = new Configuration();
    this.configurationSubject = new BehaviorSubject<Configuration>(undefined);

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer !== undefined))
      .subscribe(async (bleGattServer: BluetoothRemoteGATTServer) => {
        this.bleGattServer = bleGattServer;
        await this.updateConfiguration();
        await this.subscribeToConfigurationNotifications();
      });

    this.bluetoothService.getDeviceBleGattServer()
      .pipe(filter((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer === undefined))
      .subscribe((bleGattServer: BluetoothRemoteGATTServer) => {
        this.bleGattServer = bleGattServer;
        this.configuration = new Configuration();
        this.configurationSubject.next(undefined);
      });
  }

  public getConfiguration(): Observable<Configuration> {
    return this.configurationSubject;
  }

  public async setConfiguration(configuration: Configuration): Promise<void> {
    const customService: BluetoothRemoteGATTService = await this.bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    await BleCharacteristicWriterService.writeCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.Mode,
      configuration.mode);

    await BleCharacteristicWriterService.writeCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.ExplodeDurationInMs,
      configuration.explodeDurationInMs);

    await this.updateConfiguration();
  }

  public async setIsForceExplodeViaBleInitiated(): Promise<void> {
    const customService: BluetoothRemoteGATTService = await this.bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    await BleCharacteristicWriterService.writeCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.IsForceExplodeViaBleInitiated,
      1);

    await this.updateConfiguration();
  }

  private async updateConfiguration(): Promise<void> {
    const customService: BluetoothRemoteGATTService = await this.bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const versionCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.Version);
    this.configuration.version = versionCharacteristicValue;

    const runtimeInSecCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.RuntimeInSec);
    this.configuration.runtimeInSec = runtimeInSecCharacteristicValue;

    const modeCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.Mode);
    this.configuration.mode = modeCharacteristicValue;

    const isExplodedCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.IsExploded);
    this.configuration.isExploded = !!isExplodedCharacteristicValue;

    const explodeDurationInMsCharacteristicValue: number = await BleCharacteristicReaderService.readCharacteristicStringValue(
      customService,
      BleConstants.CustomService.Characteristics.ExplodeDurationInMs);
    this.configuration.explodeDurationInMs = explodeDurationInMsCharacteristicValue;

    this.configurationSubject.next(this.configuration);
  }

  private async subscribeToConfigurationNotifications(): Promise<void> {
    const characteristicValueChangedEventName: string = 'characteristicvaluechanged';

    const customService: BluetoothRemoteGATTService = await this.bleGattServer.getPrimaryService(BleConstants.CustomService.UUID);

    const runtimeInSecCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.RuntimeInSec);
    runtimeInSecCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const runtimeInSecCharacteristicValue: number = await BleCharacteristicReaderService.readNotificationEventStringValue(event);
      this.configuration.runtimeInSec = runtimeInSecCharacteristicValue;
      this.configurationSubject.next(this.configuration);
    });
    await runtimeInSecCharacteristic.startNotifications();

    const isExplodedCharacteristic: BluetoothRemoteGATTCharacteristic = await customService.getCharacteristic(BleConstants.CustomService.Characteristics.IsExploded);
    isExplodedCharacteristic.addEventListener(characteristicValueChangedEventName, async (event) => {
      const isExplodedCharacteristicNotificationValue: number = await BleCharacteristicReaderService.readNotificationEventStringValue(event);
      this.configuration.isExploded = !!isExplodedCharacteristicNotificationValue;
      this.configurationSubject.next(this.configuration);
    });
    await isExplodedCharacteristic.startNotifications();
  }
}
