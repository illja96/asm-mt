/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class BluetoothService {
  private static bleGattServerSubject: BehaviorSubject<BluetoothRemoteGATTServer>;
  private static isBluetoothDeviceConnectedSubject: BehaviorSubject<boolean>;

  constructor(private readonly titleService: Title) {
    if (BluetoothService.bleGattServerSubject === undefined) {
      BluetoothService.bleGattServerSubject = new BehaviorSubject<BluetoothRemoteGATTServer>(undefined);
    }
    if (BluetoothService.isBluetoothDeviceConnectedSubject === undefined) {
      BluetoothService.isBluetoothDeviceConnectedSubject = new BehaviorSubject<boolean>(false);
    }
  }

  public async promptConnectToBluetoothDevice(): Promise<void> {
    const requestDeviceOptions: RequestDeviceOptions = {
      filters: [{ namePrefix: 'ASM' }],
      optionalServices: [BleConstants.BatteryService.UUID, BleConstants.CustomService.UUID]
    };

    const bluetoothDevice: BluetoothDevice = await navigator.bluetooth.requestDevice(requestDeviceOptions);
    const bleGattServer: BluetoothRemoteGATTServer = await bluetoothDevice.gatt.connect();

    const bluetoothDeviceAddress: string = bluetoothDevice.name.replace('ASM ', '');
    this.titleService.setTitle(`ASMMT | ${bluetoothDeviceAddress}`);

    bluetoothDevice.addEventListener('gattserverdisconnected', (event: Event) => {
      console.error(event);

      BluetoothService.bleGattServerSubject.next(undefined);
      BluetoothService.isBluetoothDeviceConnectedSubject.next(false);

      this.titleService.setTitle('ASMMT');
    });

    BluetoothService.bleGattServerSubject.next(bleGattServer);
    BluetoothService.isBluetoothDeviceConnectedSubject.next(true);
  }

  public disconnectFromBluetoothDevice(): void {
    BluetoothService.bleGattServerSubject
      .pipe(
        take(1),
        tap((bleGattServer: BluetoothRemoteGATTServer) => bleGattServer.disconnect()))
      .subscribe(() => {
        BluetoothService.bleGattServerSubject.next(undefined);
        BluetoothService.isBluetoothDeviceConnectedSubject.next(false);
      });
  }

  public isBluetoothDeviceConnected(): Observable<boolean> {
    return BluetoothService.isBluetoothDeviceConnectedSubject;
  }

  public getDeviceBleGattServer(): Observable<BluetoothRemoteGATTServer> {
    return BluetoothService.bleGattServerSubject;
  }
}
