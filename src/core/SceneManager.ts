import { AmbientLight, Color, FogExp2, PerspectiveCamera, Scene, SpotLight, Vector3 } from 'three';
import { CollisionSystem } from '../systems/CollisionSystem';
import { TestEnvironment } from '../world/TestEnvironment';
export class SceneManager {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(68,innerWidth/innerHeight,0.08,85);
  readonly collisions = new CollisionSystem();
  readonly environment: TestEnvironment;
  readonly flashlight = new SpotLight(0xe2e2bb,30,24,0.48,0.55,1.5);
  constructor() {
    this.scene.background = new Color(0x070e0b); this.scene.fog = new FogExp2(0x070e0b,0.047);
    this.scene.add(new AmbientLight(0x8aa68a,0.48));
    this.environment = new TestEnvironment(this.scene,this.collisions);
    this.camera.add(this.flashlight); this.flashlight.position.set(0.15,-0.16,0);
    this.flashlight.target.position.copy(new Vector3(0,0,-8)); this.camera.add(this.flashlight.target); this.scene.add(this.camera);
  }
}
