import { Mode } from './mode';

export class Configuration {
  public version: number;
  public runtimeInSec: number;
  public mode: Mode;
  public isExploded: boolean;
  public explodeDurationInMs: number;
}
