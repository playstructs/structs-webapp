import {TutorialController as Controller} from '../../src/js/controllers/TutorialController';
import {TUTORIAL_IDS as IDs} from '../../src/js/tutorial/TutorialWorld';
import {TutorialMode} from '../../src/js/tutorial/TutorialMode';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {StructListener} from '../../src/js/grass_listeners/StructListener';
import {GuildAPI} from '../../src/js/api/GuildAPI';
import {resolvePlanetActivityNotification} from '../../src/js/util/PlanetActivityNotification';
import {PLAYER_TYPES} from '../../src/js/constants/PlayerTypes';
import {MAP_CONTAINER_IDS} from '../../src/js/constants/MapConstants';
import {STRUCT_TYPES, STRUCT_STATUS_FLAGS} from '../../src/js/constants/StructConstants';
import {EVENTS} from '../../src/js/constants/Events';

const stable=value=>value && typeof value==='object'
  ? JSON.stringify(value,(_,v)=>v && !Array.isArray(v) && typeof v==='object'
    ? Object.fromEntries(Object.keys(v).sort().map(key=>[key,v[key]])) : v) : JSON.stringify(value);

// Test-only orchestration. No replacement animation player, queue, factory or
// completion callbacks. Source captures use synthetic unit types, so only unit
// identity/type/location metadata is adapted to existing Tank art and map slots.
export class TutorialController extends Controller {
  async loading() {
    this.panel=document.createElement('aside');
    this.panel.style='position:fixed;z-index:100000;top:4px;right:4px;width:360px;max-height:46vh;overflow:auto;background:#111;color:#fff;padding:12px;font:12px monospace';
    this.panel.innerHTML='<b>Release combat renderer acceptance</b><p>Disposable simulation. Existing Tank assets; captured damage and health unchanged.</p><p id="combat-status">Loading fixture</p><button id="combat-replay" disabled>Replay captured event</button><details><summary>Recorded renderer callbacks</summary><pre id="combat-report"></pre></details>';
    document.body.append(this.panel);
    try {
      this.config=await (await fetch('/js/combat-config.json')).json();
      const index=Number(new URL(location.href).searchParams.get('combat')||9);
      this.selected=this.config.cases[index];
      if(!this.selected)throw new Error('Unknown capture');
      this.report={name:this.selected.name,index,source:'Release keeper capture replayed through real sync-state, PG, GRASS; renderer metadata adapted to existing assets',hydrated:false,started:[],completed:[],status:'ready'};
      this.prepareWorld(this.selected.detail);
      this.world.attach(this.gameState,new StructListener(this.gameState,this.guildAPI,this.structManager,PLAYER_TYPES.PLAYER));
      this.gameState.activeMapContainerId=MAP_CONTAINER_IDS.ALPHA_BASE;
      this.world.loadPlayerIntoGameState();this.world.startRaid();
      this.rerenderMap();
      MenuPage.hideAndClearDialoguePanel();MenuPage.close();
      TutorialMode.frameHomeAfterReturn(IDs.PLAYER);
      // Observe real renderer callbacks; never synthesize completion events.
      window.addEventListener(EVENTS.ANIMATION,event=>{
        this.report.started.push({id:event.structId,names:event.animationNames,options:event.options,at:performance.now()});this.publish();
      },true);
      window.addEventListener(EVENTS.ANIMATION_END,event=>{
        this.report.completed.push({id:event.structId,name:event.animationName,health:event.healthAfter,at:performance.now()});this.publish();
      },true);
      window.addEventListener(EVENTS.ANIMATION_QUEUE_EMPTY,()=>{
        clearTimeout(this.deadline);
        // The queue's listener runs before this observer, including for the last
        // callback. Finish after that same event dispatch has reached all listeners.
        queueMicrotask(()=>{
          this.report.status=this.report.completed.length===this.report.started.length?'completed':'completion-count-mismatch';
          this.report.finalHealth=Object.fromEntries([...this.units.values()].map(unit=>[unit.id,this.structManager.getStructById(unit.id)?.health]));
          this.report.renderedHealth=Object.fromEntries([...this.units.values()].map(unit=>[unit.id,document.querySelectorAll(`#alpha-base-map .map-struct-hud-layer-tile[data-struct-id="${unit.id}"] .struct-health-bar-segment.mod-filled`).length]));
          this.publish();
        });
      });
      document.getElementById('combat-replay').disabled=false;
      document.getElementById('combat-replay').onclick=()=>this.replay().catch(error=>this.fail(error));
      this.publish();
    } catch(error) {this.fail(error);}
  }

  publish() {
    document.getElementById('combat-status').textContent=`${this.report.name}: ${this.report.status} (${this.report.completed?.length||0}/${this.report.started?.length||0} callbacks; API hydration ${this.report.hydrated?'yes':'not needed'})`;
    document.getElementById('combat-report').textContent=JSON.stringify(this.report,null,2);
  }

  fail(error) {
    clearTimeout(this.deadline);
    this.report={...this.report,status:'failed',error:String(error)};this.publish();
  }

  prepareWorld(detail) {
    const world=this.world;
    world.structs=Object.fromEntries([IDs.CMD_SHIP,IDs.ENEMY_CMD_SHIP].map(id=>[id,world.structs[id]]));
    for(const unit of Object.values(world.structs)){unit.defending_struct_ids=[];unit.protected_struct_id=null;}
    this.units=new Map();let next=1;
    const add=(source,before,max,attacker=false,defenses=null)=>{
      if(this.units.has(source))return;
      const id=attacker?IDs.TANK_A:`5-${90200+next}`;
      const owner=attacker?IDs.PLAYER:IDs.RAIDER;
      const type=Object.assign(Object.create(Object.getPrototypeOf(world.getStructTypeByName(STRUCT_TYPES.TANK))),world.getStructTypeByName(STRUCT_TYPES.TANK),{id:800+next,max_health:Number(max)});
      // The synthetic native catalog can combine evasion with counter/explosion.
      // Preserve its reported defense while borrowing only the Tank's sprite set.
      if(defenses)type.unit_defenses=defenses;
      world.structTypes.push(type);
      const unit=world.makeStruct(id,STRUCT_TYPES.TANK,owner,'fleet','land',attacker?1:next-1);
      unit.type=type.id;unit.health=Number(before);
      world.structs[id]=unit;this.units.set(source,unit);next++;
    };
    add(detail.attackerStructId,detail.attackerHealthBefore,detail.attackerHealthMax,true);
    for(const shot of detail.eventAttackShotDetail){
      add(shot.targetStructId,shot.targetHealthBefore,shot.targetHealthMax,false,shot.evaded?shot.evadedCause:null);
      if(shot.blockedByStructId)add(shot.blockedByStructId,shot.blockerHealthBefore,shot.blockerHealthMax);
      if(shot.eventAttackDefenderCounterDetail.length)throw new Error('Add explicit visual mapping before using defender counter captures');
    }
  }

  adapt(detail) {
    const copy=JSON.parse(JSON.stringify(detail));
    const map=(record,prefix)=>{
      const unit=this.units.get(record[prefix+'StructId']);if(!unit)return;
      record[prefix+'StructId']=unit.id;record[prefix+'StructType']=STRUCT_TYPES.TANK;
      record[prefix+'StructTypeId']=String(unit.type);record[prefix+'PlayerId']=unit.owner;
      record[prefix+'StructLocationType']=unit.location_type;record[prefix+'StructLocationId']=unit.location_id;
      record[prefix+'StructSlot']=String(unit.slot);record[prefix+'StructOperatingAmbit']=unit.operating_ambit;
    };
    map(copy,'attacker');
    for(const shot of copy.eventAttackShotDetail){map(shot,'target');map(shot,'blockedBy');}
    return copy;
  }

  async replay() {
    document.getElementById('combat-replay').disabled=true;
    this.report.status='hydrating';this.publish();
    const api=new GuildAPI();
    // The isolated Apache fixture has its own short-lived bearer; no wallet or
    // production session is read. All parsing and API/resolver code is real.
    api.ajax.send=(method,url,data,signal)=>fetch(url,{method,signal,headers:{Authorization:'Bearer '+this.config.token}});
    const frame=this.selected.frame;
    const sourceState={guildAPI:api,signingAccount:{address:'disposable-render-fixture'},keyPlayers:{player:{id:frame.player_id,getPlanetId:()=>frame.planet_id}},isSessionCurrent:()=>true};
    const full=await resolvePlanetActivityNotification(frame,sourceState);
    if(stable(full?.detail)!==stable(this.selected.detail))throw new Error('Transport/hydration changed captured detail');
    this.report.hydrated=!!frame.stub;
    const set=(id,health)=>{
      const unit=this.units.get(id);unit.health=Number(health);
      if(unit.health===0){unit.status|=STRUCT_STATUS_FLAGS.DESTROYED;unit.destroyed_block=this.world.blockHeight;}
    };
    set(full.detail.attackerStructId,full.detail.attackerHealthAfter);
    for(const shot of full.detail.eventAttackShotDetail){
      set(shot.targetStructId,shot.targetHealthAfter);
      if(shot.blockedByStructId)set(shot.blockedByStructId,shot.blockerHealthAfter);
    }
    this.report.status='playing';this.publish();
    this.deadline=setTimeout(()=>this.fail(new Error('Real animation queue did not complete within 90 seconds')),90000);
    this.world.structListener.handleStructAttack(full.subject,{...full,detail:this.adapt(full.detail)});
  }
}
