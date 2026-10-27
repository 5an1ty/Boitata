import {settings} from '../systems/SettingsStore';
/** Independent music/effects gains, both multiplied by master and smoothed live. */
export function volumeBus(context:AudioContext,category:'music'|'effects',destination:AudioNode):{node:GainNode;dispose:()=>void}{
 const node=context.createGain();node.gain.value=settings.value.master*settings.value[category];node.connect(destination);
 const unsubscribe=settings.subscribe(()=>node.gain.setTargetAtTime(settings.value.master*settings.value[category],context.currentTime,.025));
 return {node,dispose:()=>{unsubscribe();node.disconnect();}};
}
