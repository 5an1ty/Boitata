import {settings} from '../systems/SettingsStore';
import { PerspectiveCamera } from 'three';
import type { InputManager } from '../input/InputManager';
export class CameraController {
  yaw = 0; pitch = 0;
  constructor(readonly camera: PerspectiveCamera) { camera.rotation.order = 'YXZ'; }
  update(input: InputManager): void {
    this.yaw -= input.lookX * 0.0025;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - input.lookY * 0.0025*(settings.value.invertY?-1:1)));
    input.lookX = input.lookY = 0;
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }
}
