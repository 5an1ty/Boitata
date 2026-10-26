import { Vector3 } from 'three';
import type { InputManager } from '../input/InputManager';
import type { CollisionSystem } from '../systems/CollisionSystem';
import type { CameraController } from './CameraController';
export class PlayerController {
  readonly position = new Vector3(0, 1.65, 13);
  private verticalSpeed = 0;
  constructor(private readonly view: CameraController, private readonly collisions: CollisionSystem) { view.camera.position.copy(this.position); }
  update(input: InputManager, dt: number): void {
    this.view.update(input);
    let x = Number(input.keys.has('KeyD')) - Number(input.keys.has('KeyA')) + input.moveX;
    let z = Number(input.keys.has('KeyW')) - Number(input.keys.has('KeyS')) + input.moveY;
    const magnitude = Math.max(1, Math.hypot(x,z)); x /= magnitude; z /= magnitude;
    const speed = (input.running || input.keys.has('ShiftLeft') || input.keys.has('ShiftRight') ? 5.2 : 2.7) * dt;
    const yaw = this.view.yaw;
    this.collisions.move(this.position, (x * Math.cos(yaw) - z * Math.sin(yaw)) * speed, (-x * Math.sin(yaw) - z * Math.cos(yaw)) * speed);
    this.verticalSpeed -= 9.8 * dt; this.position.y += this.verticalSpeed * dt;
    if (this.position.y <= 1.65) { this.position.y = 1.65; this.verticalSpeed = 0; }
    this.view.camera.position.copy(this.position);
  }
}
