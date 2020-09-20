/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class BluetoothService {
  private bleGattServerSubject: BehaviorSubject<BluetoothRemoteGATTServer>;
  private isBluetoothDeviceConnectedSubject: BehaviorSubject<boolean>;

  constructor() {
    this.bleGattServerSubject = new BehaviorSubject<BluetoothRemoteGATTServer>(undefined);
    this.isBluetoothDeviceConnectedSubject = new BehaviorSubject<boolean>(false);
  }

  public promptConnectToBluetoothDevice(): void {
    const requestDeviceOptions: RequestDeviceOptions = {
      filters: [{ name: 'Airsoft smart mine' }],
      optionalServices: [BleConstants.BatteryService.UUID, BleConstants.CustomService.UUID]
    };

    navigator.bluetooth.requestDevice(requestDeviceOptions)
      .then((bluetoothDevice: BluetoothDevice) => bluetoothDevice.gatt.connect())
      .then((bleGattServer: BluetoothRemoteGATTServer) => this.bleGattServerSubject.next(bleGattServer))
      .then(() => this.isBluetoothDeviceConnectedSubject.next(true))
      .catch((error) => {
        console.error(error);
        this.isBluetoothDeviceConnectedSubject.next(false);
      });
  }

  public disconnectFromBluetoothDevice(): void {
    this.bleGattServerSubject
      .pipe(
        take(1),
        tap((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer.disconnect()))
      .subscribe(() => {
        this.bleGattServerSubject.next(undefined);
        this.isBluetoothDeviceConnectedSubject.next(false);
      });
  }

  public isBluetoothDeviceConnected(): Observable<boolean> {
    return this.isBluetoothDeviceConnectedSubject;
  }

  public getDeviceBleGattServer(): Observable<BluetoothRemoteGATTServer> {
    return this.bleGattServerSubject;
  }
}
