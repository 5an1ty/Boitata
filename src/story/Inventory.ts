import {ITEMS,type ItemId} from '../data/chapter1';
export type ItemState='available'|'used';
export class Inventory {
  readonly items=new Map<ItemId,ItemState>([['flashlight','available'],['radio','available']]);
  add(id:ItemId):boolean {if(this.items.has(id))return false;this.items.set(id,'available');return true;}
  has(id:ItemId):boolean{return this.items.has(id);}
  use(id:ItemId):void {if(this.has(id))this.items.set(id,'used');}
  describe(id:ItemId):string{return ITEMS[id].description;}
}
