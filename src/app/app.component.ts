import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BluetoothService } from 'src/services/bluetooth.service';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isBluetoothDeviceConnected: boolean;

  private batteryLevel: number;
  private isExploded: boolean;

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly configurationService: ConfigurationService) {
    this.isBluetoothDeviceConnected = false;
    this.batteryLevel = undefined;
    this.isExploded = undefined;

    this.bluetoothService.isBluetoothDeviceConnected()
      .subscribe((isBluetoothDeviceConnected: boolean) => this.isBluetoothDeviceConnected = isBluetoothDeviceConnected);

    const notificationIconUrl: string = 'favicon.ico';
    const notificationVibratePattern: VibratePattern = [100, 50, 100, 50, 100, 50, 100, 50, 100];

    this.configurationService.getBatteryLevel()
      .pipe(filter((batteryLevel: number) => batteryLevel !== undefined))
      .subscribe((batteryLevel: number) => {
        const sendBatteryNotification: boolean =
          (this.batteryLevel >= 50 && batteryLevel < 50) ||
          (this.batteryLevel >= 15 && batteryLevel < 15);

        if (sendBatteryNotification) {
          const notificationOptions: NotificationOptions = {
            icon: notificationIconUrl,
            vibrate: notificationVibratePattern,
            body: `Battery level is ${batteryLevel}`
          };
          const notification: Notification = new Notification('ASMMT', notificationOptions);
        }

        this.batteryLevel = batteryLevel;
      });

    this.configurationService.getConfiguration()
      .pipe(filter((configuration: Configuration) => configuration !== undefined))
      .subscribe((configuration: Configuration) => {
        if (configuration.IsExploded && !this.isExploded) {
          const notificationOptions: NotificationOptions = {
            icon: notificationIconUrl,
            vibrate: notificationVibratePattern,
            body: `Mine exploded`
          };
          const notification: Notification = new Notification('ASMMT', notificationOptions);
        }

        this.isExploded = configuration.IsExploded;
      });
  }
}
