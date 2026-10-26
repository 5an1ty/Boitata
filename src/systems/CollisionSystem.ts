import { Box3, Vector3 } from 'three';
export class CollisionSystem {
  readonly solids: Box3[] = [];
  add(center: Vector3, size: Vector3): Box3 { const box = new Box3().setFromCenterAndSize(center, size); this.solids.push(box); return box; }
  remove(box: Box3): void { const index=this.solids.indexOf(box); if(index>=0)this.solids.splice(index,1); }
  blocked(position: Vector3, radius: number): boolean {
    return this.solids.some(b => position.y - 1.65 < b.max.y && position.y + 0.15 > b.min.y && position.x + radius > b.min.x && position.x - radius < b.max.x && position.z + radius > b.min.z && position.z - radius < b.max.z);
  }
  move(position: Vector3, dx: number, dz: number): void {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
    for (let i = 0; i < steps; i++) {
      position.x += dx / steps;
      if (this.blocked(position, 0.28)) position.x -= dx / steps;
      position.z += dz / steps;
      if (this.blocked(position, 0.28)) position.z -= dz / steps;
      position.x = Math.max(-58, Math.min(58, position.x));
      position.z = Math.max(-58, Math.min(58, position.z));
    }
  }
}
