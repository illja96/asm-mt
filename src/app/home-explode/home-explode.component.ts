import { Component } from '@angular/core';
import { BleConfigurationService } from 'src/services/ble-configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-explode',
  templateUrl: './home-explode.component.html',
  styleUrls: ['./home-explode.component.css']
})
export class HomeExplodeComponent {
  public configuration: Configuration;
  public isInitiateButtonLocked: boolean;

  constructor(private readonly bleConfigurationService: BleConfigurationService) {
    this.configuration = undefined;
    this.isInitiateButtonLocked = true;

    this.bleConfigurationService.getConfiguration()
      .subscribe((configuration: Configuration) => this.configuration = configuration);
  }

  public async onInitiateExplosionClick(): Promise<void> {
    await this.bleConfigurationService.setIsForceExplodeViaBleInitiated();
  }

  public onLockUnlockButtonClick(): void {
    this.isInitiateButtonLocked = !this.isInitiateButtonLocked;
  }
}
