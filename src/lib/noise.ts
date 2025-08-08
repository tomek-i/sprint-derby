export class ValueNoise {
  private values: number[];
  private seed: number;

  constructor(seed: number = Math.random()) {
    this.seed = seed * 1e9;
    this.values = [];
    // Pre-calculate 256 random values
    for (let i = 0; i < 256; i++) {
      this.values[i] = this.random();
    }
  }

  // Simple LCG pseudo-random number generator
  private random() {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  // Smoothing function (cosine interpolation)
  private smooth(x: number): number {
    return (1 - Math.cos(x * Math.PI)) / 2;
  }

  private lerp(a: number, b: number, x: number): number {
    return a * (1 - x) + b * x;
  }

  public get(x: number): number {
    const xFloor = Math.floor(x);
    const t = x - xFloor;

    // Get random values for the integer coordinates
    const v0 = this.values[xFloor & 255];
    const v1 = this.values[(xFloor + 1) & 255];

    const tSmooth = this.smooth(t);
    return this.lerp(v0, v1, tSmooth);
  }
}
