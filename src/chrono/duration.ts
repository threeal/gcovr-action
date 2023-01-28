export class Duration {
  ms: number;

  constructor(ms: number) {
    this.ms = ms;
  }

  toString(): string {
    let ms = Math.floor(this.ms);
    if (ms < 1000) {
      return `${ms}ms`;
    }
    let s = Math.floor(ms / 1000);
    ms = ms - s * 1000;
    if (s < 60) {
      return `${s}s ${ms}ms`;
    }
    let m = Math.floor(s / 60);
    s = s - m * 60;
    if (m < 60) {
      return `${m}m ${s}s`;
    }
    const h = Math.floor(m / 60);
    m = m - h * 60;
    return `${h}h ${m}m`;
  }
}
