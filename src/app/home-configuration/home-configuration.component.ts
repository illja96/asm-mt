import { Component, Input } from '@angular/core';
import { Configuration } from 'src/models/configuration';

@Component({
  selector: 'app-home-configuration',
  templateUrl: './home-configuration.component.html',
  styleUrls: ['./home-configuration.component.css']
})
export class HomeConfigurationComponent {
  @Input()
  public configuration: Configuration;
}
