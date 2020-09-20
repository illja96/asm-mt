import { Component, Input } from '@angular/core';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-info-status',
  templateUrl: './home-info-status.component.html',
  styleUrls: ['./home-info-status.component.css']
})
export class HomeInfoStatusComponent {
  @Input()
  public isBluetoothDeviceConnected: boolean;

  @Input()
  public batteryLevel: number;

  @Input()
  public configuration: Configuration;
}
