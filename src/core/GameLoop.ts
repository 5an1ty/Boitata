export class GameLoop {
  private frame = 0;
  private previous = 0;
  constructor(private readonly update: (dt: number, rawDt: number) => void) {}
  start(): void {
    this.previous = performance.now();
    const tick = (now: number) => {
      this.frame = requestAnimationFrame(tick);
      const rawDt=(now-this.previous)/1000;
      this.update(Math.min(rawDt,0.05),rawDt);
      this.previous = now;
    };
    this.frame = requestAnimationFrame(tick);
  }
  stop(): void { cancelAnimationFrame(this.frame); }
}
