export const
  ANIMATION = {
    NAMES: {
      ATTACK: {
        PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
        SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
      },
      DEPLOYMENT: {
        SPACE: 'DEPLOYMENT_SPACE',
        AIR: 'DEPLOYMENT_AIR',
        LAND: 'DEPLOYMENT_LAND',
        WATER: 'DEPLOYMENT_WATER',
      },
      DESTROY: {
        SPACE: 'DESTROY_SPACE',
        AIR: 'DESTROY_AIR',
        LAND: 'DESTROY_LAND',
        WATER: 'DESTROY_WATER',
      },
      FIRST: 'FIRST',
      LAST: 'LAST',
      MOVE: {
        ARRIVE: 'MOVE_ARRIVE',
        DEPART: 'MOVE_DEPART',
      },
      STEALTH: {
        ACTIVATE: 'STEALTH_ACTIVATE',
        DEACTIVATE: 'STEALTH_DEACTIVATE',
      },
      IMPACT: {
        ANGLED: {
          DOWN: {
            CANNON: 'IMPACT_ANGLED_DOWN_CANNON',
            MISSILE: 'IMPACT_ANGLED_DOWN_MISSILE',
            TORPEDO: 'IMPACT_ANGLED_DOWN_TORPEDO'
          },
          UP: {
            CANNON: 'IMPACT_ANGLED_UP_CANNON',
            GATLING: 'IMPACT_ANGLED_UP_GATLING',
            MISSILE: 'IMPACT_ANGLED_UP_MISSILE',
            TORPEDO: 'IMPACT_ANGLED_UP_TORPEDO'
          },
        },
        HORIZONTAL: {
          CANNON: 'IMPACT_HORIZONTAL_CANNON',
          GATLING: 'IMPACT_HORIZONTAL_GATLING',
          MISSILE: 'IMPACT_HORIZONTAL_MISSILE',
          TORPEDO: 'IMPACT_HORIZONTAL_TORPEDO',
        }
      },
      EVADE: 'EVADE',
      SHAKE: {
        ANGLED: {
          DOWN: {
            DEFAULT: {
              FIRST: 'SHAKE_ANGLED_DOWN_DEFAULT_FIRST',
              LAST: 'SHAKE_ANGLED_DOWN_DEFAULT_LAST',
            }
          },
          UP: {
            DEFAULT: {
              FIRST: 'SHAKE_ANGLED_UP_DEFAULT_FIRST',
              LAST: 'SHAKE_ANGLED_UP_DEFAULT_LAST',
            },
            GATLING: {
              FIRST: 'SHAKE_ANGLED_UP_GATLING_FIRST',
              LAST: 'SHAKE_ANGLED_UP_GATLING_LAST',
            }
          },
        },
        HORIZONTAL: {
          DEFAULT: {
            FIRST: 'SHAKE_HORIZONTAL_DEFAULT_FIRST',
            LAST: 'SHAKE_HORIZONTAL_DEFAULT_LAST',
          },
          GATLING: {
            FIRST: 'SHAKE_HORIZONTAL_GATLING_FIRST',
            LAST: 'SHAKE_HORIZONTAL_GATLING_LAST',
          }
        },
        ATTACK: {
          PRIMARY_WEAPON: 'ATTACK_PRIMARY_WEAPON',
          SECONDARY_WEAPON: 'ATTACK_SECONDARY_WEAPON',
        }
      }
    },
    PROJECTILES: {
      CANNON: 'CANNON',
      GATLING: 'GATLING',
      MISSILE: 'MISSILE',
      TORPEDO: 'TORPEDO',
    }
  }
;
