import { Component } from '@angular/core';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-configuration',
  templateUrl: './home-configuration.component.html',
  styleUrls: ['./home-configuration.component.css']
})
export class HomeConfigurationComponent {
  public configuration: Configuration;

  constructor(private readonly configurationService: ConfigurationService) {
    this.configuration = undefined;

    this.configurationService.getConfiguration()
      .subscribe((configuration: Configuration) => this.configuration = configuration);
  }
}
