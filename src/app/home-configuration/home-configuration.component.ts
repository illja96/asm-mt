import { Component } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { BleConfigurationService } from 'src/services/ble-configuration.service';
import { Configuration } from 'src/models/configuration';
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

  constructor(private readonly bleConfigurationService: BleConfigurationService) {
    this.configurationForm = new FormGroup({
      version: new FormControl(undefined),
      runtimeInSec: new FormControl(undefined),
      mode: new FormControl(undefined, [Validators.required, Validators.min(0), Validators.max(2)]),
      isExploded: new FormControl(undefined),
      explodeDurationInMs: new FormControl(undefined, [Validators.required, Validators.min(0), Validators.max(60000)]),
    });

    this.modeOptions = [
      { value: Mode.Any, text: 'Sensor + BLE' },
      { value: Mode.SensorOnly, text: 'Sensor only' },
      { value: Mode.BleOnly, text: 'BLE only' }
    ];

    this.bleConfigurationService.getConfiguration()
      .pipe(filter((configuration: Configuration) => configuration !== undefined))
      .subscribe((configuration: Configuration) => {
        this.updateFormValuesIfPristine(configuration);
        this.updateRoundedRuntimeValues(configuration);
      });
  }

  public onConfigurationFormSubmit(): void {
    const configuration = this.configurationForm.value as Configuration;
    this.bleConfigurationService.setConfiguration(configuration);
  }

  private updateRoundedRuntimeValues(configuration: Configuration): void {
    this.runtimeInSecRoundedToMinute = configuration.runtimeInSec % 60;
    this.runtimeInMinRoundedToHour = Math.floor(configuration.runtimeInSec % 3600 / 60);
    this.runtimeInHoursRounded = Math.floor(configuration.runtimeInSec / 3600);
  }

  private updateFormValuesIfPristine(configuration: Configuration): void {
    if (this.configurationForm.controls.version.pristine) {
      this.configurationForm.controls.version.setValue(configuration.version);
    }

    if (this.configurationForm.controls.runtimeInSec.pristine) {
      this.configurationForm.controls.runtimeInSec.setValue(configuration.runtimeInSec);
    }

    if (this.configurationForm.controls.mode.pristine) {
      this.configurationForm.controls.mode.setValue(configuration.mode);
    }

    if (this.configurationForm.controls.isExploded.pristine) {
      this.configurationForm.controls.isExploded.setValue(configuration.isExploded);
    }

    if (this.configurationForm.controls.explodeDurationInMs.pristine) {
      this.configurationForm.controls.explodeDurationInMs.setValue(configuration.explodeDurationInMs);
    }
  }
}
