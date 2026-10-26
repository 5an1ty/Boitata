import type { WebGLRenderer } from 'three';
export type Quality = 'Baixo' | 'Médio' | 'Alto';
export class GraphicsSettings {
  quality: Quality = 'Médio';
  adaptive = true;
  renderDistance = 48;
  setDistance(distance:number):void { this.renderDistance=Math.max(28,Math.min(72,distance)); }
  private scale = 1;
  private elapsed = 0;
  private frames = 0;
  constructor(private readonly renderer: WebGLRenderer) {
    try { const saved = localStorage.getItem('boitata-quality'); if (saved === 'Baixo' || saved === 'Médio' || saved === 'Alto') this.quality = saved; } catch { /* Storage can be unavailable in private browsing. */ }
  }
  set(quality: Quality): void {
    this.quality = quality; this.scale = 1;
    try { localStorage.setItem('boitata-quality', quality); } catch { /* Settings remain valid for this session. */ }
    this.resize();
  }
  resize(): void {
    const factor = { Baixo: 0.35, Médio: 0.5, Alto: 0.75 }[this.quality];
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(Math.max(1, Math.floor(innerWidth * factor * this.scale)), Math.max(1, Math.floor(innerHeight * factor * this.scale)), false);
  }
  sample(dt: number): void {
    if (!this.adaptive || dt <= 0) return;
    this.elapsed += dt; this.frames++;
    if (this.elapsed < 3) return;
    const fps = this.frames / this.elapsed, before = this.scale;
    if (fps < 35) this.scale = Math.max(0.6, this.scale - 0.1);
    else if (fps > 55) this.scale = Math.min(1, this.scale + 0.05);
    this.elapsed = this.frames = 0;
    if (before !== this.scale) this.resize();
  }
}
