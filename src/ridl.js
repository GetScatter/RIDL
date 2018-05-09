import ecc from 'eosjs-ecc';

import IdentityService from './services/identity';
import ReputationService from './services/reputation';
import SecurityService from './services/security';

class RIDL {

    constructor(){
        this.identity =     new IdentityService();
        this.reputation =   new ReputationService();
        this.security =     new SecurityService();
    }

}

export default new RIDL();



