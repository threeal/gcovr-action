export class Duration {
  ms: number;

  constructor(ms: number) {
    this.ms = ms;
  }

  toString(): string {
    return this.ms.toString();
  }
}
