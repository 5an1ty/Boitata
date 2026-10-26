import {Ray,Vector3} from 'three';
import type {CollisionSystem} from '../systems/CollisionSystem';
import {Navigation} from './Navigation';
export const AI_STATES=['DORMANT','PATROL','INVESTIGATE','STALK','CHASE','SEARCH','RETREAT'] as const;
export type AIState=typeof AI_STATES[number];
export interface CreatureStimulus {position:Vector3;look:Vector3;flashlight:boolean;moving:boolean;running:boolean;narrativeReady:boolean;protected:boolean;}
export interface Perception {visible:boolean;beam:boolean;heard:boolean;distance:number;}
export class BoitataAI {
 state:AIState='DORMANT';readonly position=new Vector3(22,1.65,44);readonly forward=new Vector3(-1,0,0);readonly lastKnown=new Vector3();readonly navigation:Navigation;
 suspicion=0;stateTime=0;lostTime=0;chaseTime=0;onCapture:()=>void=()=>{};onTransition:(from:AIState,to:AIState)=>void=()=>{};
 private planTime=0;private path:Vector3[]=[];private patrolIndex=0;
 private readonly patrol=[new Vector3(12,1.65,39),new Vector3(22,1.65,39),new Vector3(22,1.65,46),new Vector3(12,1.65,46)];
 constructor(private readonly collisions:CollisionSystem){this.navigation=new Navigation(collisions);}
 transition(state:AIState):void {if(state===this.state)return;const before=this.state;this.state=state;this.stateTime=0;this.planTime=0;this.path=[];if(state==='CHASE')this.chaseTime=0;this.onTransition(before,state);}
 activate(position:Vector3):void {if(this.state!=='DORMANT')return;this.position.copy(this.navigation.nearest(position));this.suspicion=0;this.transition('PATROL');}
 perceive(input:CreatureStimulus):Perception {
  const delta=input.position.clone().sub(this.position),distance=delta.length();delta.normalize();
  const beam=input.flashlight&&input.look.dot(delta.clone().negate())>.94&&distance<28;
  const ray=new Ray(this.position.clone(),delta);const point=new Vector3();
  const occluded=this.collisions.solids.some(b=>ray.intersectBox(b,point)!==null&&this.position.distanceTo(point)<distance-.15);
  const fov=this.forward.dot(new Vector3(delta.x,0,delta.z).normalize())>Math.cos(55*Math.PI/180);
  return {distance,beam:beam&&!occluded,visible:!input.protected&&!occluded&&distance<(beam?28:input.flashlight?20:12)&&(fov||beam||distance<2.4),heard:!input.protected&&!occluded&&input.moving&&distance<(input.running?15:5)};
 }
 update(dt:number,input:CreatureStimulus):Perception {
  const sense=this.perceive(input);if(this.state==='DORMANT')return sense;
  this.stateTime+=dt;
  if(!input.narrativeReady){this.transition('DORMANT');return sense;}
  if(input.protected&&this.state!=='RETREAT')this.transition('RETREAT');
  if(sense.visible){this.lastKnown.copy(input.position);this.lostTime=0;}else this.lostTime+=dt;
  switch(this.state){
   case 'PATROL':
    this.travel(this.patrol[this.patrolIndex],1.5,dt);if(this.position.distanceTo(this.patrol[this.patrolIndex])<1)this.patrolIndex=(this.patrolIndex+1)%this.patrol.length;
    if(sense.visible)this.transition('STALK');else if(sense.heard){this.lastKnown.copy(input.position);this.transition('INVESTIGATE');}break;
   case 'INVESTIGATE':
    this.travel(this.lastKnown,1.9,dt);if(sense.visible)this.transition('STALK');else if(this.stateTime>7)this.transition('SEARCH');break;
   case 'STALK':
    if(sense.visible){this.turnToward(input.position,dt);this.suspicion=Math.min(1,this.suspicion+dt*(sense.beam?.8:input.flashlight?.2:sense.distance<5?.35:-.2));this.suspicion=Math.max(0,this.suspicion);}
    else this.suspicion=Math.max(0,this.suspicion-dt*.35);
    if(this.stateTime>3&&sense.visible&&(this.suspicion>=1||sense.distance<2))this.transition('CHASE');else if(this.lostTime>3)this.transition('SEARCH');else if(this.stateTime>13&&this.suspicion<.1)this.transition('RETREAT');break;
   case 'CHASE':
    this.chaseTime+=dt;this.travel(this.lastKnown,Math.min(3.9,2.2+this.stateTime*.7),dt);
    if(sense.visible&&sense.distance<1.15){this.onCapture();this.transition('RETREAT');}
    else if(this.lostTime>1.2)this.transition('SEARCH');else if(this.chaseTime>18)this.transition('RETREAT');break;
   case 'SEARCH':
    this.travel(this.lastKnown,1.8,dt);if(this.position.distanceTo(this.lastKnown)<1.3)this.forward.applyAxisAngle(new Vector3(0,1,0),dt*.65);if(sense.visible)this.transition('STALK');else if(this.stateTime>7)this.transition('RETREAT');break;
   case 'RETREAT':
    this.travel(this.patrol[2],2.8,dt);if(this.stateTime>6)this.transition('DORMANT');break;
  }
  return sense;
 }
 private turnToward(target:Vector3,dt:number):void {const direction=target.clone().sub(this.position).setY(0).normalize();this.forward.lerp(direction,1-Math.exp(-dt*3)).normalize();}
 private travel(goal:Vector3,speed:number,dt:number):void {
  this.planTime-=dt;if(this.planTime<=0){this.path=this.navigation.path(this.position,goal);this.planTime=.7;}
  const next=this.path[0];if(!next)return;this.turnToward(next,dt);
  // Steering is smooth, displacement follows the swept-safe path, never a wall shortcut.
  this.navigation.move(this.position,next,speed*dt);if(this.position.distanceTo(next)<.12)this.path.shift();
 }
}
