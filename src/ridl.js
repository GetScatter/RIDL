import * as eos from './services/eos'
import IdentityService from './services/identity';
import ReputationService from './services/reputation';
import BondService from "./services/bond";
import Reputable, {Reputation, Fragment, RepType} from "./models/Reputable";


const FRAG_TYPES = {
	BLOCKCHAIN_ADDR:'acc',
	ACTION:'act',
	APPLICATION:'app',
	IDENTITY:'id',
	OTHER:'etc',
}

export {
	Reputable,
	Reputation,
	Fragment,
	RepType,
	FRAG_TYPES,
};

class RIDL {

    constructor(){
        this.identity =     new IdentityService();
        this.reputation =   new ReputationService();
        this.bond =         new BondService();
    }

    /***
     * Initializes RIDL for a specified account. Can be re-initialized as
     * many times as needed.
     * -------------------------------
     * Can be initialized as a reader only by passing nulls into the
     * account and signProvider parameters.
     * @param network
     * @param account
     * @param signProvider
     * @returns {Promise}
     */
    init(network, account = null, signProvider = null){
        return eos.init(network, account, signProvider);
    }

    canConnect(){
        return eos.canConnect();
    }

}

export default new RIDL();



