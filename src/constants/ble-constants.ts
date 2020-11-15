export const BleConstants = {
  BatteryService: {
    UUID: '0000180f-0000-1000-8000-00805f9b34fb',
    Characteristics: {
      BatteryLevel: '00002a19-0000-1000-8000-00805f9b34fb'
    }
  },
  CustomService: {
    UUID: '00000001-0001-0001-0001-000000000000',
    Characteristics: {
      Version: '00000001-0001-0001-0001-000000000001',
      RuntimeInSec: '00000001-0001-0001-0001-000000000002',
      Mode: '00000001-0001-0001-0001-000000000003',
      IsExploded: '00000001-0001-0001-0001-000000000004',
      ExplodeDurationInMs: '00000001-0001-0001-0001-000000000005',
      IsForceExplodeViaBleInitiated: '00000001-0001-0001-0001-000000000006'
    }
  }
};
