import { AmbientLight, Color, FogExp2, PerspectiveCamera, Scene, SpotLight, Mesh, Vector3 } from 'three';
import { CollisionSystem } from '../systems/CollisionSystem';
import { GameWorld } from '../world/GameWorld';
export class SceneManager {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(68,innerWidth/innerHeight,0.08,85);
  readonly collisions = new CollisionSystem();
  readonly environment: GameWorld;
  readonly flashlight = new SpotLight(0xe2e2bb,30,24,0.48,0.55,1.5);
  constructor() {
    this.scene.background = new Color(0x070e0b); this.scene.fog = new FogExp2(0x070e0b,0.032);
    this.scene.add(new AmbientLight(0xa4b4c0,0.65));
    this.environment = new GameWorld(this.scene,this.collisions);
    this.scene.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;}});
    this.flashlight.castShadow=true;this.flashlight.shadow.mapSize.set(512,512);this.flashlight.shadow.bias=-.0004;this.flashlight.shadow.normalBias=.025;this.flashlight.shadow.camera.near=.15;this.flashlight.shadow.camera.far=24;
    this.camera.add(this.flashlight); this.flashlight.position.set(0.15,-0.16,0);
    this.flashlight.target.position.copy(new Vector3(0,0,-8)); this.camera.add(this.flashlight.target); this.scene.add(this.camera);
  }
}
