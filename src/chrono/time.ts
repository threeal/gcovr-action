import { Duration } from "./duration";

export class Time {
  ms: number;

  constructor(ms: number) {
    this.ms = ms;
  }

  elapsed(): Duration {
    return new Duration(Date.now() - this.ms);
  }
}

export function now(): Time {
  return new Time(Date.now());
}
