/**
 * @param {string} text
 * @return {string}
 */
const hl = (text) => `<span class="tutorial-highlight">${text}</span>`;

/**
 * @param {string} name file name in /img/sui/icon, without extension
 * @return {string}
 */
const icon = (name) => `<img class="tutorial-inline-icon" src="/img/sui/icon/${name}.png" alt="">`;

/**
 * The tutorial's narration, verbatim from the design.
 */
export const TUTORIAL_COPY = {
  SIMULATION_LOADING: 'Simulation loading...',

  WELCOME: `Welcome to ${hl('Combat Training')}. This simulation will teach you to defend your mining operations in the uncharted regions.`,
  ALPHA_BASE: `On each planet you explore, you will establish an ${hl('Alpha Base')}, like this one, to harvest Alpha Matter.`,
  ALPHA_ORE: `${hl('Alpha Ore')}, the raw form of Alpha Matter, is mined from the planet by an ${hl('Extractor')}.`,
  REFINERY: `Alpha Ore is dangerously unstable. To be useful, it must first be refined into stable ${hl('Alpha Matter')} at a ${hl('Refinery')}.`,
  ORE_RESERVES: `Your current ${hl('Ore Reserves')} are shown here.`,
  ORE_THEFTS: `Ore thefts are common in the uncharted regions. You must be prepared to defend your Ore Reserves against ${hl('Raiders')}.`,
  CMD_SHIP: `The ${hl('CMD Ship')} is the vanguard of your operations in the uncharted regions. Defending it is the key to victory in combat encounters.`,
  CMD_SHIP_DESTROYED_WARNING: `If your CMD Ship is destroyed, you will be unable to deploy new Structs and your Alpha Base will be vulnerable.`,

  RAIDERS_ATTACK: `Conveniently, Raiders have just launched an attack on your Alpha Base.`,
  PLANETARY_DEFENSES: `This icon represents your ${hl('Planetary Defenses')}. Raiders must ${hl('Breach')} these Defenses in order to steal your Ore Reserves.`,
  CMD_SHIP_PROTECTS: `The CMD Ship protects your Base from intrusion. When a CMD Ship is on-station, your Defenses are ${hl('Secure')} and cannot be breached by Raiders.`,
  DEFENSE_STATUS: `Check your Planetary Defense ${hl('Status')} at any time by pressing and holding the icon.`,
  CMD_SHIP_DESTROYED: `Your CMD Ship has been destroyed! Raiders are now attempting to ${hl('Breach')} Planetary Defenses!`,
  BREACH_COUNTDOWN: `The Breach takes time--the ${hl('Breach Countdown')} estimates the time remaining until the Breach is successful and the enemy steals your Ore.`,

  SUMMON_CMD_SHIP: `You must summon a new CMD Ship to re-secure your planetary Defenses. Select the highlighted tile.`,
  ACTION_BAR: `This is the ${hl('Action Bar')}, where you can review information about a tile and issue commands.`,
  PRESS_AND_HOLD: `You can ${hl('press-and-hold')} icons in the Action Bar to learn more about a tile or Struct.`,
  DEPLOY: `To summon a new CMD Ship, press the ${hl('Deploy')} button and select the CMD Ship from the Deploy Menu.`,
  DEPLOY_MENU_TITLE: `Deploy Struct`,
  DEPLOY_MENU_HINT: `<p>Press a Struct to Deploy it.</p><p>Press-and-Hold to reveal more information about it.</p>`,
  CMD_SHIP_ON_ITS_WAY: `Good. The New CMD Ship is on it's way.`,
  BATTERY: `This is the ${hl('Battery')}. Most actions, such as deploying Structs or launching attacks, deplete the Battery.`,
  BATTERY_RECHARGE: `The Battery will ${hl('Recharge')} automatically over time.`,
  CMD_SHIP_DELAYED: `The new CMD Ship won't arrive for some time--and the enemy Breach is already underway.`,

  ENGAGE_ENEMY: `You will need to engage the enemy forces to protect your Ore Reserves.`,
  KEY_TO_VICTORY: `The key to victory is the ${hl('enemy CMD Ship')}. Destroy it, and the raiders will be forced to retreat.`,
  SELECT_TANK: `First, select your Tank.`,
  RAIL_GUN: `The Tank's ${hl('Rail Gun')} ability can target Structs on Land. Use it to attack the enemy CMD Ship.`,
  RAIL_GUN_TARGET: `The Tanks ${hl('Rail Gun')} ability can target Structs on Land. Use it to attack the enemy CMD Ship.`,

  WENT_POORLY: `That went poorly. The enemy CMD Ship was ${hl('Defended')} by a Tank.`,
  DEFENDER_COUNTER_ATTACK: `The Defender hit your Tank with a ${icon('icon-defender-counter')} ${hl('Counter-Attack')}. Be careful when launching attacks: Defenders always fire first.`,
  DEFENDER_BLOCKED: `The Defender also ${icon('icon-defender-block')} ${hl('Blocked')} your attack, absorbing the incoming DMG and protecting the CMD Ship.`,
  CMD_SHIP_COUNTER_ATTACK: `The CMD Ship also launched its own ${icon('icon-counter-attack')} ${hl('Counter-Attack')}, destroying your tank.`,
  // Icons as drawn in the design frame for this line.
  DEFENDED_AND_DEFENDERS: `Structs with &nbsp;the ${icon('icon-defending')} icon are ${hl('Defended')}. Structs with the ${icon('icon-defended')} icon are ${hl('Defenders')}.`,
  DESTROY_DEFENDER_FIRST: `You'll need to destroy the enemy Defender before you can attack the CMD Ship directly.`,

  ONE_MORE_TANK: `Fortunately, you have one more Tank. Select it now.`,
  SUFFICIENT_BATTERY: `Before you attack, make sure you have sufficient ${hl('Battery.')}`,
  BATTERY_COST: `You can Press-and-hold an ability to see its ${hl('Battery Cost')}.`,
  ATTACK_ENEMY_TANK: `When ready, attack the enemy Tank with your own Tank.`,
  ATTACK_ENEMY_TANK_TARGET: `When ready, attack the enemy Tank.`,
  TRIGGERED_COUNTER_ATTACK: `Your attack triggered a ${hl('Counter-Attack')}. Most Structs automatically launch Counter-Attacks when targeted.`,
  AVOID_COUNTER_ATTACKS: `You can avoid Counter-Attacks by considering the abilities of each Struct.`,
  BATTLEGROUNDS: `Each planet has multiple ${hl('Battlegrounds')}, ${icon('icon-land')} Land, ${icon('icon-water')} Water, ${icon('icon-air')} Air, and ${icon('icon-space')} Space.`,
  RAIL_GUN_LAND_ONLY: `The Tank's Rail Gun can only target Land. You can use this to your advantage.`,
  STEALTH_BOMBER: `A Stealth Bomber can attack the enemy Tank from the safety of the Air.`,

  SELECT_BOMBER: `Select the Stealth Bomber.`,
  BOMBER_DESTROY_TANK: `When ready, use the Stealth Bomber to destroy the enemy Tank.`,
  SUCCESS: `Success! Remember to review enemy abilities and defenses before you strike to penetrate formations and avoid damaging counter-attacks.`,
  CLOSE_TO_VICTORY: `You are close to victory. Use what you have learned to destroy the enemy CMD Ship.`,

  RAIDERS_REPELLED: `You have successfully repelled the Raiders. However, without a CMD Ship on-station, your Planetary Defenses are still Vulnerable.`,
  CMD_SHIP_ARRIVING: `Fortunately, your new CMD Ship is arriving now.`,
  DEFENSES_SECURE: `With a new CMD Ship on-station, your Planetary Defenses are ${hl('Secure')}.`,
  REPLACEMENT_COSTS: `CMD Ship replacement costs will be deducted from your salary. It is your responsibility to protect valuable SN.CORP assets.`,
  ASSIGN_DEFENDERS: `You can protect Structs by assigning your own ${hl('Defenders')}.`,
  SELECT_THE_TANK: `Start by selecting the Tank.`,
  DEFEND: `Assign the Tank to protect the CMD Ship using the ${hl('Defend')} ability.`,
  TANK_DEFENDING: `Good. The Tank is now Defending the CMD Ship.`,
  FLEET_STRUCTS_DEFEND: `All Fleet Structs can be assigned to Defend allied units.`,
  PROTECT_COMPANY_ASSETS: `Employees are expected to make every effort to protect company assets. Plan your defenses accordingly.`,

  CONGRATULATIONS: `Congratulations: you have successfully completed Basic Training.`,
  CERTIFIED: `SN.CORP certifies that you now meet the minimum requirements to operate the ST-21 "Spearpoint" CMD Ship. Productive travels, employee.`,
  FTL_JUMP: `FTL Jump in Progress.`,
};
