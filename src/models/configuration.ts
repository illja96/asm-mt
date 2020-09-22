import { Mode } from "./mode";

export class Configuration {
  public Version: number;
  public RuntimeInSec: number;
  public Mode: Mode;
  public IsExploded: boolean;
  public ExplodeDurationInMs: number;

  public get RuntimeInSecRoundedToMinute(): number {
    return this.RuntimeInSec % 60;
  }

  public get RuntimeInMinRoundedToHour(): number {
    return Math.floor(this.RuntimeInSec % 3600 / 60);
  }

  public get RuntimeInHoursRounded(): number {
    return Math.floor(this.RuntimeInSec / 3600);
  }
}