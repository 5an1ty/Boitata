import { Vector3 } from 'three';
import type { InputManager } from '../input/InputManager';
import type { CollisionSystem } from '../systems/CollisionSystem';
import type { CameraController } from './CameraController';
export class PlayerController {
  readonly position = new Vector3(5, 1.65, 15);
  private verticalSpeed = 0;
  constructor(private readonly view: CameraController, private readonly collisions: CollisionSystem) { view.camera.position.copy(this.position); }
  resetAt(position:Vector3):void {this.position.copy(position);this.verticalSpeed=0;this.view.camera.position.copy(position);this.view.yaw=Math.PI;this.view.pitch=0;this.view.camera.rotation.set(0,Math.PI,0);}
  update(input: InputManager, dt: number): void {
    this.view.update(input);
    const below=this.position.clone();below.y-=.025;
    const grounded=this.position.y<=1.6501||this.collisions.blocked(below,.28);
    if(input.consumeJump()&&grounded&&this.verticalSpeed<=0)this.verticalSpeed=4.2;
    let x = Number(input.keys.has('KeyD')) - Number(input.keys.has('KeyA')) + input.moveX;
    let z = Number(input.keys.has('KeyW')) - Number(input.keys.has('KeyS')) + input.moveY;
    const magnitude = Math.max(1, Math.hypot(x,z)); x /= magnitude; z /= magnitude;
    const speed = (input.running || input.keys.has('ShiftLeft') || input.keys.has('ShiftRight') ? 5.2 : 2.7) * dt;
    const yaw = this.view.yaw;
    this.collisions.move(this.position, (x * Math.cos(yaw) - z * Math.sin(yaw)) * speed, (-x * Math.sin(yaw) - z * Math.cos(yaw)) * speed);
    this.verticalSpeed -= 9.8 * dt;
    // Swept vertical movement prevents jumping through ceilings or furniture.
    const dy=this.verticalSpeed*dt,steps=Math.max(1,Math.ceil(Math.abs(dy)/.04));
    for(let i=0;i<steps;i++){
      this.position.y+=dy/steps;
      if(this.collisions.blocked(this.position,.28)){this.position.y-=dy/steps;this.verticalSpeed=0;break;}
    }
    if (this.position.y <= 1.65) { this.position.y = 1.65; this.verticalSpeed = 0; }
    this.view.camera.position.copy(this.position);
  }
}
