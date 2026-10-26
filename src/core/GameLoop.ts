export class GameLoop {
  private frame = 0;
  private previous = 0;
  constructor(private readonly update: (dt: number) => void) {}
  start(): void {
    this.previous = performance.now();
    const tick = (now: number) => {
      this.frame = requestAnimationFrame(tick);
      this.update(Math.min((now - this.previous) / 1000, 0.05));
      this.previous = now;
    };
    this.frame = requestAnimationFrame(tick);
  }
  stop(): void { cancelAnimationFrame(this.frame); }
}
