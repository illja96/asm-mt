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

  public async promptConnectToBluetoothDevice(): Promise<void> {
    const requestDeviceOptions: RequestDeviceOptions = {
      filters: [{ namePrefix: 'ASM' }],
      optionalServices: [BleConstants.BatteryService.UUID, BleConstants.CustomService.UUID]
    };

    const bluetoothDevice: BluetoothDevice = await navigator.bluetooth.requestDevice(requestDeviceOptions);
    const bleGattServer: BluetoothRemoteGATTServer = await bluetoothDevice.gatt.connect();

    bluetoothDevice.addEventListener('gattserverdisconnected', (event: Event) => {
      this.bleGattServerSubject.next(undefined);
      this.isBluetoothDeviceConnectedSubject.next(false);
    });

    this.bleGattServerSubject.next(bleGattServer);
    this.isBluetoothDeviceConnectedSubject.next(true);
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
