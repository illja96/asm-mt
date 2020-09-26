export abstract class BleCharacteristicWriterService {
  private static encoder: TextEncoder = new TextEncoder();

  public static async writeCharacteristicStringValue(service: BluetoothRemoteGATTService, characteristicUuid: string, value: any): Promise<void> {
    const stringValue: string = value.toString();
    const encodedValue: Uint8Array = BleCharacteristicWriterService.encoder.encode(stringValue);
    const characteristic: BluetoothRemoteGATTCharacteristic = await service.getCharacteristic(characteristicUuid);
    await characteristic.writeValue(encodedValue);
  }
}
