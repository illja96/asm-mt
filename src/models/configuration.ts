import { Mode } from "./mode";

export class Configuration {
  public Version: number;
  public RuntimeInSec: number;
  public Mode: Mode;
  public IsExploded: boolean;
  public ExplodeDurationInMs: number;
  public IsForceExplodeViaBleInitiated: boolean;
}