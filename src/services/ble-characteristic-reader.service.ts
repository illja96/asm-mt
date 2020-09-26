export abstract class BleCharacteristicReaderService {
  private static decoder: TextDecoder = new TextDecoder('utf-8');

  public static async readNotificationEventByteValue(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationValue: number = characteristicNotificationRawValue.getUint8(0);

    return characteristicNotificationValue;
  }

  public static async readNotificationEventStringValue(event: Event): Promise<number> {
    const characteristicNotification: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const characteristicNotificationRawValue: DataView = await characteristicNotification.readValue();
    const characteristicNotificationDecodedValue: string = BleCharacteristicReaderService.decoder.decode(characteristicNotificationRawValue);
    const characteristicNotificationValue: number = parseInt(characteristicNotificationDecodedValue);

    return characteristicNotificationValue;
  }

  public static async readCharacteristicByteValue(service: BluetoothRemoteGATTService, characteristicUuid: string): Promise<number> {
    const characteristic: BluetoothRemoteGATTCharacteristic = await service.getCharacteristic(characteristicUuid);
    const characteristicRawValue: DataView = await characteristic.readValue();
    const characteristicValue: number = characteristicRawValue.getUint8(0);

    return characteristicValue;
  }

  public static async readCharacteristicStringValue(service: BluetoothRemoteGATTService, characteristicUuid: string): Promise<number> {
    const characteristic: BluetoothRemoteGATTCharacteristic = await service.getCharacteristic(characteristicUuid);
    const characteristicRawValue: DataView = await characteristic.readValue();
    const characteristicDecodedValue: string = BleCharacteristicReaderService.decoder.decode(characteristicRawValue);
    const characteristicValue: number = parseInt(characteristicDecodedValue);

    return characteristicValue;
  }
}
