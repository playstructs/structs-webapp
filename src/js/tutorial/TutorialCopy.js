/**
 * @param {string} text
 * @return {string}
 */
const hl = (text) => `<span class="tutorial-highlight">${text}</span>`;

/**
 * A game term in the design's second highlight colour; press-and-hold it for a tip.
 * The tip opens below, since narration often sits at the top of the screen.
 *
 * @param {string} text
 * @param {string} tip
 * @return {string}
 */
const hint = (text, tip) => `<a class="sui-mod-secondary" href="javascript: void(0)" data-sui-tooltip="${tip}" data-sui-mod-placement="bottom">${text}</a>`;

/**
 * @param {string} name file name in /img/sui/icon, without extension
 * @return {string}
 */
const icon = (name) => `<img class="tutorial-inline-icon" src="/img/sui/icon/${name}.png" alt="">`;

/**
 * The tutorial's narration, verbatim from the design apart from corrected typos.
 */
export const TUTORIAL_COPY = {
  SIMULATION_LOADING: 'Simulation loading...',

  WELCOME: `Welcome to ${hl('Combat Training')}. This simulation will teach you to defend your mining operations in the uncharted regions.`,
  ALPHA_BASE: `On each planet you explore, you will establish an ${hl('Alpha Base')}, like this one, to harvest Alpha Matter.`,
  ALPHA_ORE: `${hl('Alpha Ore')}, the raw form of Alpha Matter, is mined from the planet by an ${hl('Extractor')}.`,
  REFINERY: `Alpha Ore is dangerously unstable. To be useful, it must first be refined into stable ${hl('Alpha Matter')} at a ${hl('Refinery')}.`,
  ORE_RESERVES: `Your current ${hl('Ore Reserves')} are shown here.`,
  ORE_THEFTS: `Ore thefts are common in the uncharted regions. You must be prepared to defend your Ore Reserves against ${hl('Raiders')}.`,
  CMD_SHIP: `The ${hl('CMD Ship')} is the hub of your operations. Defending it is the key to your success.`,
  CMD_SHIP_DESTROYED_WARNING: `If your CMD Ship is destroyed, you will be unable to deploy new Structs and your Alpha Base will be vulnerable.`,

  RAIDERS_ATTACK: `Conveniently, Raiders have just launched an attack on your Alpha Base.`,
  PLANETARY_DEFENSES: `This icon represents your ${hl('Planetary Defenses')}. Raiders must ${hl('Breach')} these Defenses in order to steal your Ore Reserves.`,
  INSPECT_DEFENSES: `You can Press-and-hold to ${hl('Inspect')} most HUD elements. Inspect your Planetary Defenses to see their status.`,
  CMD_SHIP_PROTECTS: `The CMD Ship protects your Ore Reserves from intrusion. When a CMD Ship is on-station, your Defenses are ${hl('Secure')} and cannot be breached.`,
  CMD_SHIP_DESTROYED: `Your CMD Ship has been destroyed! Raiders are now attempting to ${hl('Breach')} Planetary Defenses!`,
  BREACH_COUNTDOWN: `The Breach takes time--the ${hl('Breach Countdown')} estimates the time remaining until the enemy steals your Ore.`,

  SUMMON_CMD_SHIP: `You must summon a new CMD Ship to re-secure your planetary Defenses. Select the highlighted tile.`,
  DEPLOY: `Use the ${hl('Deploy')} ability to summon a new CMD Ship.`,
  DEPLOY_MENU_TITLE: `Deploy Struct`,
  DEPLOY_MENU_HINT: `<p>Press a Struct to Deploy it.</p><p>Press-and-Hold to Inspect it.</p>`,
  BATTERY_DEPLETES: `Good. Note that using abilities depletes the ${hl('Battery')}. The Battery will ${hl('Recharge')} automatically.`,

  CMD_SHIP_UNPROTECTED: `Your CMD Ship was unprotected, allowing the Raiders to easily Destroy it. Assign ${hl('Defenders')} to protect important Structs.`,
  SELECT_INDICATED_TANK: `First, select indicated Tank.`,
  DEFEND_OTHER_TANK: `When you have enough Battery Charge, assign the Struct to ${hl('Defend')} your other Tank. You can ${hint('Inspect', 'Press-and-Hold most elements to reveal more information about them.')} an ability to see its Battery Cost.`,
  ASSIGN_DEFENSE: `Next, assign it to ${hl('Defend')} your other Tank.`,
  // Icons as drawn in the design frame for this line.
  DEFENDED_AND_DEFENDERS: `Good. Structs with the ${icon('icon-defending')} icon are ${hl('Defended')}. Structs with the ${icon('icon-defended')} icon are ${hl('Defenders')}.`,
  CMD_SHIP_TAKES_TIME: `Your new CMD Ship will take time to arrive. You will need to engage the enemy in the meantime.`,

  DESTROY_ENEMY_CMD_SHIP: `Destroying the ${hl('enemy CMD Ship')} will force the raiders to retreat.`,
  SELECT_TANK: `Select your Tank.`,
  RAIL_GUN: `The Tank's ${hl('Rail Gun')} ability can target Structs on Land. Use it to attack the enemy CMD Ship.`,

  WENT_POORLY: `That went poorly. The enemy CMD Ship was ${hl('Defended')} by a Tank.`,
  DEFENDER_COUNTER_ATTACK: `The Defender hit your Tank with a ${icon('icon-defender-counter')} ${hl('Counter-Attack')}. Be careful when launching attacks: Defenders always fire first.`,
  DEFENDER_BLOCKED: `The Defender also ${icon('icon-defender-block')} ${hl('Blocked')} your attack, absorbing the incoming DMG and protecting the CMD Ship.`,
  CMD_SHIP_COUNTER_ATTACK: `The CMD Ship then launched its own ${icon('icon-counter-attack')} ${hl('Counter-Attack')}, destroying your tank.`,
  DESTROY_DEFENDER_FIRST: `You'll need to destroy the enemy Defender before you can attack the CMD Ship directly.`,

  ONE_MORE_TANK: `Fortunately, you have one more Tank. Select it now.`,
  ATTACK_ENEMY_TANK: `When ready, attack the enemy Tank.`,
  TRIGGERED_COUNTER_ATTACK: `Your attack triggered a ${hl('Counter-Attack')}. You can avoid Counter-Attacks by considering the abilities of each Struct.`,
  BATTLEGROUNDS: `Each planet has multiple ${hl('Battlegrounds')}, ${icon('icon-land')} Land, ${icon('icon-water')} Water, ${icon('icon-air')} Air, and ${icon('icon-space')} Space.`,
  RAIL_GUN_LAND_ONLY: `The enemy Tank's Rail Gun can only target ${hl('Land')}. Use this to your advantage.`,

  STEALTH_BOMBER: `A Stealth Bomber can attack from the safety of the air. When ready, use it to destroy the Tank.`,
  SUCCESS: `Success! Remember to review enemy abilities and defenses before you strike to penetrate formations and avoid damaging counter-attacks.`,
  CLOSE_TO_VICTORY: `You are close to victory. Use what you have learned to destroy the enemy CMD Ship.`,

  RAIDERS_REPELLED: `You have successfully repelled the Raiders. However, without a CMD Ship on-station, your Planetary Defenses are still Vulnerable.`,
  CMD_SHIP_ARRIVING: `Fortunately, your new CMD Ship is arriving now.`,
  DEFENSES_SECURE: `With a new CMD Ship on-station, your Planetary Defenses are ${hl('Secure')}.`,

  COMPLETED: `You have successfully completed Combat Training. ${hl('Performance Grade:')} C-`,
  CERTIFIED: `SN.CORP certifies that you now meet the minimum requirements to operate the ST-21 "Spearpoint" CMD Ship. Productive travels, employee.`,
  FTL_JUMP: `FTL Jump in Progress.`,
};
