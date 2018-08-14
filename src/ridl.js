import ecc from 'eosjs-ecc';

import * as eos from './services/eos'
import IdentityService from './services/identity';
import ReputationService from './services/reputation';
import SecurityService from './services/security';

class RIDL {

    constructor(){
        this.identity =     new IdentityService();
        this.reputation =   new ReputationService();
        this.security =     new SecurityService();
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



