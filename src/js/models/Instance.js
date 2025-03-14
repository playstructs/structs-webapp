import { stringToPath, Random, Bip39 } from "@cosmjs/crypto";
import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";

// import {Server} from "../cosmos/Server"
import {assertIsDeliverTxSuccess} from "@cosmjs/stargate";

/**
 * Instance Model
 */
export class Instance {
    constructor() {
      this.active = false;
      this.server = undefined;

      this.name = '';
      this.mood = '';

      this.wallet = undefined;
      this.address = '';

      this.wattUnderManagement = 0;

      this.mnemonic = null;

      this.fee = {
        amount: [
          {
            denom: "watt",
            amount: "1",
          },
        ],
        gas: "180000",
      };
    }

    /**
     * Used when instantiating a non-signing Instance object
     *
     * @param {string} address
     * @param {string} name
     * @param {string} mood
     * @param {numeric} wattUnderManagement
     */
    stub(address, name, mood, wattUnderManagement) {
      this.address = address;
      this.name = name;
      this.mood = mood;
      this.wattUnderManagement = wattUnderManagement;

      return this;
    }

  /**
   * force = true //destroys old account!
   *
   * Should probably create some sort of account
   * graveyard instead of just saving over the old one
   *
   * @param {string} mnemonic
   * @param {boolean} force
   */
   async init(mnemonic = '', force = false) {
     let identity = JSON.parse(localStorage.getItem('identity'));

      if (identity === null || (typeof identity === 'undefined') || force) {
          identity = await this.createIdentity(mnemonic);
      }

      console.log(identity.address);
      console.log(identity.mnemonic);
      this.name = identity.name;
      this.mood = identity.mood;
      this.mnemonic = identity.mnemonic;
      this.address = identity.address;

    }


  /**
   * force = true //destroys old account!
   *
   * Should probably create some sort of account
   * graveyard instead of just saving over the old one
   *
   * @param {string} mnemonic
   * @param {boolean} force
   */
  async initActive(mnemonic = '', force = false) {
    let identity = JSON.parse(localStorage.getItem('identity'));

    if (identity === null || (typeof identity === 'undefined') || force) {
      identity = await this.createIdentity(mnemonic);
    }

    console.log(identity.address)
    this.name = identity.name;
    this.mood = identity.mood;
    this.mnemonic = identity.mnemonic;
    this.address = identity.address;

    this.server = new Server();
    await this.server.init(await this.getWallet());

    this.active = true;

  }


    /*
     * Used if you just want to pull from the local storage without the
     * possibility of create. Main benefit is that there is no async/await.
     */
     lazyLoad() {
      let identity = JSON.parse(localStorage.getItem('identity'));

      if (!(identity === null || (typeof identity === 'undefined'))) {

        this.name = identity.name;
        this.mood = identity.mood;
        this.mnemonic = identity.mnemonic;
        this.address = identity.address;

      }
    }

  /**
   * @param {string} mnemonic
   */
    async createIdentity(mnemonic) {

        if ( mnemonic === '') {
            console.log('Generating new mnemonic because none was provided.');

            // Add this constant (16) to the Constants.js file
            const getNewRandom = Random.getBytes(16);
            mnemonic = Bip39.encode(getNewRandom).toString();
        }


        this.mnemonic = mnemonic;
        const [account] = await this.getAccounts();

        const identity = {
            name: null,
            mood: null,
            mnemonic: mnemonic,
            address: account.address
        }


        localStorage.setItem('identity', JSON.stringify(identity));

        return identity;


    }
    async getWallet() {

        // Path and Prefix should both me constants in constant.js
        this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
            this.mnemonic,
            stringToPath("m/44'/118'/0'/0/0"),
            "droid"
        );

        return this.wallet;
    }

  /**
   * @param {string} newName
   */
    async setName(newName) {

        const msgRename = {
            typeUrl: "/di.MsgUpdateInstanceName",
            value: {
                creator: this.address,
                name: newName
            }
        };

        let result = await this.server.client.signAndBroadcast(this.address, [msgRename], this.fee);
        assertIsDeliverTxSuccess(result);

        this.name = newName;
        this.saveLocalInstance();
    }

  /**
   * @param {string} newMood
   */
    async setMood(newMood) {

        const msgRemood = {
            typeUrl: "/di.MsgUpdateInstanceMood",
            value: {
                creator: this.address,
                mood: newMood
            }
        };

        let result = await this.server.client.signAndBroadcast(this.address, [msgRemood], this.fee);
        assertIsDeliverTxSuccess(result);

        this.mood = newMood;
        this.saveLocalInstance();
    }

    saveLocalInstance() {
        const identity = {
            name: this.name,
            mood: this.mood,
            mnemonic: this.mnemonic,
            address: this.address
        }

        localStorage.setItem('identity', JSON.stringify(identity));
    }

    /*
     * getAccounts()
     *
     * Use:
     *  const instance = new Instance();
     *  await instance.init();
     *  const [firstAccount] = await instance.getAccounts();
     */
    async getAccounts() {
        if (typeof this.wallet == 'undefined' ) {
            this.wallet = await this.getWallet();
        }

        return this.wallet.getAccounts();
    }

  /**
   * @param {Object} computeResult
   * @param {Object} personalization
   */
    async performPatent(computeResult, personalization) {
       console.log("Patenting")


        const msgCreateSchematic = {
            typeUrl: "/di.MsgCreateSchematic",
            value: {
                creator: this.address,
                name:personalization.name,
                description:personalization.description,
                hash:computeResult.hash,
                input:computeResult.input,
                owner: this.address
            }
        };


        let result = await this.server.client.signAndBroadcast(this.address, [msgCreateSchematic], this.fee);
        console.log(result)
        //assertIsBroadcastTxSuccess(result);

        return result;

    }

  /**
   * @param {Object} computeResult
   * @param {Object} personalization
   */
    async performBuild(computeResult, personalization) {

        console.log(computeResult)

        const msgCreateStructure = {
            typeUrl: "/di.MsgCreateStructure",
            value: {
                creator: this.address,
                name:personalization.name,
                description:personalization.description,
                hash:computeResult.hash,
                input:computeResult.input,
                schematic: computeResult.compute_process.program.schematic.hash,
                performingStructure: computeResult.compute_process.program.performing_structure.id,
                owner: this.address
            }
        };

        console.log(msgCreateStructure)

        let result = await this.server.client.signAndBroadcast(this.address, [msgCreateStructure], this.fee);
        console.log(result)

        //assertIsBroadcastTxSuccess(result);

        return result;

    }
  /**
   * @param {Object} computeResult
   */
  async performAttack(computeResult) {

    console.log(computeResult)

    const msgAttackStructure = {
      typeUrl: "/di.MsgAttackStructure",
      value: {
        creator: this.address,
        aimCalculationHash:computeResult.hash,
        aimCalculationInput:computeResult.input,
        targetStructure: computeResult.compute_process.program.target_structure.id,
        performingStructure: computeResult.compute_process.program.performing_structure.id
      }
    };

    console.log(msgAttackStructure)

    let result = await this.server.client.signAndBroadcast(this.address, [msgAttackStructure], this.fee);
    console.log(result)

    //assertIsBroadcastTxSuccess(result);

    return result;

  }

  /**
   * @param {StructureRepair} program
   */
  async performRepair(program) {

    const msgRepairStructure = {
      typeUrl: "/di.MsgRepairStructure",
      value: {
        creator: this.address,
        targetStructure: program.target_structure.id,
        performingStructure: program.performing_structure.id
      }
    };

    console.log(msgRepairStructure)

    let result = await this.server.client.signAndBroadcast(this.address, [msgRepairStructure], this.fee);
    console.log(result)

    //assertIsBroadcastTxSuccess(result);

    return result;

  }

  /**
   * @param {StructureDrain} program
   */
  async performDrain(program) {

    const msgDrainStructure = {
      typeUrl: "/di.MsgDrainStructure",
      value: {
        creator: this.address,
        targetStructure: program.target_structure.id,
        performingStructure: program.performing_structure.id
      }
    };

    console.log(msgDrainStructure)

    let result = await this.server.client.signAndBroadcast(this.address, [msgDrainStructure], this.fee);
    console.log(result)

    //assertIsBroadcastTxSuccess(result);

    return result;

  }

  /**
   * @param {Structure} structure
   * @param {number} slowNumber
   * @param {string} droidID
   */
  async performConnectChargeSlot(structure, slotNumber, droidID) {

    const msgConnectChargeSlotStructure = {
      typeUrl: "/di.MsgStructureChargeSlot",
      value: {
        creator: this.address,
        targetAddress: droidID,
        performingStructure: structure.id,
        chargeSlot: slotNumber
      }
    };

    console.log(msgConnectChargeSlotStructure)

    let result = await this.server.client.signAndBroadcast(this.address, [msgConnectChargeSlotStructure], this.fee);
    console.log(result)

    //assertIsBroadcastTxSuccess(result);

    return result;

  }
    /*
     *
     */
    async queryBalance() {

      let balance_query_result = await this.server.client.getBalance(this.address, "watt")

      if (typeof balance_query_result == 'undefined' || balance_query_result == null){
        balance_query_result = {amount: 0, denom:'watt'}
      }

      return balance_query_result;
    }


}


/*      // We cannot get both in one request (see https://github.com/cosmos/gaia/issues/75)
      const sentQuery = withFilters(`message.module=bank&message.sender=${query.sentFromOrTo}`);
      const receivedQuery = withFilters(`message.module=bank&transfer.recipient=${query.sentFromOrTo}`);
      const sent = await this.txsQuery(sentQuery);
*/
