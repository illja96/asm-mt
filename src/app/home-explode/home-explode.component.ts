import { Component } from '@angular/core';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-explode',
  templateUrl: './home-explode.component.html',
  styleUrls: ['./home-explode.component.css']
})
export class HomeExplodeComponent {
  public configuration: Configuration;
  public isInitiateButtonLocked: boolean;

  constructor(private readonly configurationService: ConfigurationService) {
    this.configuration = undefined;
    this.isInitiateButtonLocked = true;

    this.configurationService.getConfiguration()
      .subscribe((configuration: Configuration) => this.configuration = configuration);
  }

  public onInitiateExplosionClick(): void {
    this.configurationService.initiateExplosionViaBle();
  }

  public onLockUnlockButtonClick(): void {
    this.isInitiateButtonLocked = !this.isInitiateButtonLocked;
  }
}
