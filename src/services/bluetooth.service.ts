/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class BluetoothService {
  private bleGattServer: BluetoothRemoteGATTServer;
  private bleGattServerSubject: BehaviorSubject<BluetoothRemoteGATTServer>;

  private isBluetoothDeviceConnectedSubject: BehaviorSubject<boolean>;

  constructor() {
    this.bleGattServer = undefined;
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
      .then((bleGattServer: BluetoothRemoteGATTServer) => {
        this.bleGattServer = bleGattServer;
        this.bleGattServerSubject.next(this.bleGattServer);

        return this.bleGattServer;
      })
      .then(() => this.isBluetoothDeviceConnectedSubject.next(true))
      .catch(() => this.isBluetoothDeviceConnectedSubject.next(false));
  }

  public disconnectFromBluetoothDevice(): void {
    if (this.bleGattServer !== undefined) {
      this.bleGattServer.disconnect();

      this.bleGattServer = undefined;
      this.bleGattServerSubject.next(this.bleGattServer);
    }

    this.isBluetoothDeviceConnectedSubject.next(false);
  }

  public isBluetoothDeviceConnected(): Observable<boolean> {
    return this.isBluetoothDeviceConnectedSubject;
  }

  public getDeviceBleGattServer(): Observable<BluetoothRemoteGATTServer> {
    return this.bleGattServerSubject;
  }
}
