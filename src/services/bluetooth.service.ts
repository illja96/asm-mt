/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { BleConstants } from '../constants/ble-constants';

@Injectable()
export class BluetoothService {
  private static bluetoothDevice: BluetoothDevice = undefined;
  private static bleGattServer: BluetoothRemoteGATTServer = undefined;
  private static bleGattServerSubject: BehaviorSubject<BluetoothRemoteGATTServer> = new BehaviorSubject<BluetoothRemoteGATTServer>(BluetoothService.bleGattServer);
  private static isBluetoothDeviceConnectedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private static registeredBleDevices: string[] = [];

  constructor(private readonly titleService: Title) { }

  public async promptConnectToBluetoothDevice(): Promise<void> {
    const requestDeviceOptions: RequestDeviceOptions = {
      filters: [{ namePrefix: 'ASM' }],
      optionalServices: [BleConstants.BatteryService.UUID, BleConstants.CustomService.UUID]
    };

    BluetoothService.bluetoothDevice = await navigator.bluetooth.requestDevice(requestDeviceOptions);

    const isBluetoothDeviceNotRegistered: boolean = BluetoothService.registeredBleDevices.indexOf(BluetoothService.bluetoothDevice.name) === -1;
    if (isBluetoothDeviceNotRegistered) {
      BluetoothService.bluetoothDevice.addEventListener('gattserverdisconnected', (event: Event) => {
        BluetoothService.bluetoothDevice = undefined;
        BluetoothService.bleGattServer = undefined;
        BluetoothService.bleGattServerSubject.next(BluetoothService.bleGattServer);
        BluetoothService.isBluetoothDeviceConnectedSubject.next(false);

        this.titleService.setTitle('ASMMT');
      });

      BluetoothService.registeredBleDevices.push(BluetoothService.bluetoothDevice.name);
    }

    BluetoothService.bleGattServer = await BluetoothService.bluetoothDevice.gatt.connect();

    const bluetoothDeviceAddress: string = BluetoothService.bluetoothDevice.name.replace('ASM ', '');
    this.titleService.setTitle(`ASMMT | ${bluetoothDeviceAddress}`);

    BluetoothService.bleGattServerSubject.next(BluetoothService.bleGattServer);
    BluetoothService.isBluetoothDeviceConnectedSubject.next(true);
  }

  public disconnectFromBluetoothDevice(): void {
    BluetoothService.bleGattServer.disconnect();
  }

  public isBluetoothDeviceConnected(): Observable<boolean> {
    return BluetoothService.isBluetoothDeviceConnectedSubject;
  }

  public getDeviceBleGattServer(): Observable<BluetoothRemoteGATTServer> {
    return BluetoothService.bleGattServerSubject;
  }
}
