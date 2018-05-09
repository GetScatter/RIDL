import ecc from 'eosjs-ecc';

import IdentityService from './services/identity';
import ReputationService from './services/reputation';
import SecurityService from './services/security';

export default class RIDL {

    constructor(){
        this.identity =     new IdentityService();
        this.reputation =   new ReputationService();
        this.security =     new SecurityService();
    }

    async stringToSha256(string){
        return ecc.sha256(string);
    }
}



