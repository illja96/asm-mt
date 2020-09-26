import { Component } from '@angular/core';
import { BluetoothService } from 'src/services/bluetooth.service';
import { BleBatteryService } from 'src/services/ble-battery.service';
import { BleConfigurationService } from 'src/services/ble-configuration.service';
import { NotificationsService } from 'src/services/notifications.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-info-status',
  templateUrl: './home-info-status.component.html',
  styleUrls: ['./home-info-status.component.css']
})
export class HomeInfoStatusComponent {
  public isBluetoothDeviceConnected: boolean;
  public batteryLevel: number;
  public configuration: Configuration;

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly bleBatteryService: BleBatteryService,
    private readonly bleConfigurationService: BleConfigurationService,
    private readonly notificationService: NotificationsService) {
    this.isBluetoothDeviceConnected = false;
    this.batteryLevel = undefined;
    this.configuration = undefined;

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    this.bleBatteryService.getBatteryLevel()
      .subscribe((batteryLevel: number) => {
        if (this.batteryLevel !== undefined && batteryLevel !== undefined) {
          this.sendBatteryNotifications(batteryLevel);
        }
        this.batteryLevel = batteryLevel;
      });

    this.bleConfigurationService.getConfiguration()
      .subscribe((configuration: Configuration) => {
        if (this.configuration !== undefined && configuration !== undefined) {
          this.sendMineStateNotifications(configuration);
        }
        this.configuration = configuration;
      });
  }

  private sendBatteryNotifications(batteryLevel: number): void {
    const notificationTitle: string = 'ASMMT';
    const notificationIconUrl: string = 'favicon.ico';

    const isBatteryLevelDescendToNextLevel: boolean =
      (this.batteryLevel >= 50 && batteryLevel < 50) ||
      (this.batteryLevel >= 15 && batteryLevel < 15);

    if (isBatteryLevelDescendToNextLevel) {
      const notificationOptions: NotificationOptions = {
        icon: notificationIconUrl,
        body: `Battery level is ${batteryLevel}%`
      };

      this.notificationService.showNotification(notificationTitle, notificationOptions);
    }
  }

  private sendMineStateNotifications(configuration: Configuration): void {
    const notificationTitle: string = 'ASMMT';
    const notificationIconUrl: string = 'favicon.ico';

    const isMineExploded = !this.configuration.isExploded && configuration.isExploded;
    if (isMineExploded) {
      const notificationOptions: NotificationOptions = {
        icon: notificationIconUrl,
        body: 'Mine exploded'
      };

      this.notificationService.showNotification(notificationTitle, notificationOptions);
    }
  }
}
