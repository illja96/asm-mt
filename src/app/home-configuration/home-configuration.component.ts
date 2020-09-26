import { Component } from '@angular/core';
import { ConfigurationService } from 'src/services/configuration.service';
import { Configuration } from 'src/models/configuration';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Mode } from 'src/models/mode';

@Component({
  selector: 'app-home-configuration',
  templateUrl: './home-configuration.component.html',
  styleUrls: ['./home-configuration.component.css']
})
export class HomeConfigurationComponent {
  public configurationForm: FormGroup;
  public runtimeInSecRoundedToMinute: number;
  public runtimeInMinRoundedToHour: number;
  public runtimeInHoursRounded: number;
  public modeOptions: { value: Mode, text: string }[];

  public get version(): AbstractControl {
    return this.configurationForm.controls.version;
  }

  public get runtimeInSec(): AbstractControl {
    return this.configurationForm.controls.runtimeInSec;
  }

  public get mode(): AbstractControl {
    return this.configurationForm.controls.mode;
  }

  public get isExploded(): AbstractControl {
    return this.configurationForm.controls.isExploded;
  }

  public get explodeDurationInMs(): AbstractControl {
    return this.configurationForm.controls.explodeDurationInMs;
  }

  constructor(private readonly configurationService: ConfigurationService) {
    this.configurationForm = new FormGroup({
      version: new FormControl(undefined),
      runtimeInSec: new FormControl(undefined),
      mode: new FormControl(undefined, [Validators.required, Validators.min(0), Validators.max(2)]),
      isExploded: new FormControl(undefined),
      explodeDurationInMs: new FormControl(undefined, [Validators.required, Validators.min(0), Validators.max(60000)]),
    });

    this.configurationForm.controls.runtimeInSec.valueChanges
      .subscribe((runtimeInSec: number) => {
        this.runtimeInSecRoundedToMinute = runtimeInSec % 60;
        this.runtimeInMinRoundedToHour = Math.floor(runtimeInSec % 3600 / 60);
        this.runtimeInHoursRounded = Math.floor(runtimeInSec / 3600);
      });

    this.modeOptions = [
      { value: Mode.Any, text: 'Sensor + BLE' },
      { value: Mode.SensorOnly, text: 'Sensor only' },
      { value: Mode.BleOnly, text: 'BLE only' }
    ];

    this.configurationService.getConfiguration()
      .subscribe((configuration: Configuration) => {
        if (this.configurationForm.controls.version.value === undefined || !this.configurationForm.controls.version.touched) {
          this.configurationForm.controls.version.setValue(configuration.version);
        }

        if (this.configurationForm.controls.runtimeInSec.value === undefined || !this.configurationForm.controls.runtimeInSec.touched) {
          this.configurationForm.controls.runtimeInSec.setValue(configuration.runtimeInSec);
        }

        if (this.configurationForm.controls.mode.value === undefined || !this.configurationForm.controls.mode.touched) {
          this.configurationForm.controls.mode.setValue(configuration.mode);
        }

        if (this.configurationForm.controls.isExploded.value === undefined || !this.configurationForm.controls.isExploded.touched) {
          this.configurationForm.controls.isExploded.setValue(configuration.isExploded);
        }

        if (this.configurationForm.controls.explodeDurationInMs.value === undefined || !this.configurationForm.controls.explodeDurationInMs.touched) {
          this.configurationForm.controls.explodeDurationInMs.setValue(configuration.explodeDurationInMs);
        }
      });
  }

  public onConfigurationFormSubmit(): void {
    const configuration = this.configurationForm.value as Configuration;
    this.configurationService.setConfiguration(configuration);
  }
}
