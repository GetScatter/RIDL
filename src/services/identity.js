
import * as eos from './eos'
import Identity from '../models/Identity'
import ClaimReservation from '../models/ClaimReservation'
import murmur from 'murmurhash';

const fingerprinted = username => murmur.v2(username.toLowerCase());

const getIdentity = async (username) => {
    return await eos.read({
        table:'ids',
        index:fingerprinted(username),
        limit:1,
        model:Identity,
        firstOnly:true
    });
};

export default class IdentityService {

    constructor(){}

    validName(name){
        return /^[a-zA-Z0-9_-]{3,20}$/.test(name);
    }

    async get(name){
        return getIdentity(name);
    }

    async payAndIdentify(username, key){
        return eos.writer.transaction(['eosio.token', 'ridlridlridl'], contracts => {
            contracts.eosio_token.transfer(eos.account.name, 'ridlridlridl', '1.0000 EOS', `${eos.account.name} ${username}`, eos.options);
            contracts.ridlridlridl.identify(username, key, eos.account.name, eos.options);
        })
    }

    async payForIdentity(username, toAccount){
        return eos.writer.transfer(eos.account.name, 'ridlridlridl', '1.0000 EOS', `${toAccount} ${username}`, eos.options);
    }

    async claimPaidIdentity(username, key){
        return eos.contract.identify(username, key, eos.account.name, eos.options);
    }

    async claim(username, key, signature){
        return eos.contract.claim(username, key, signature, eos.account.name, eos.options)
            .then(() => this.get(username))
            .catch(err => null);
    }

    async rekey(username, key){
        return eos.contract.rekey(fingerprinted(username), eos.account.name, key, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

    async setaccount(username, account, signature){
        return eos.contract.setaccount(fingerprinted(username), account, signature, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

    async release(username, signedHash){
        return eos.contract.release(fingerprinted(username), eos.account.name, signedHash, eos.options)
            .then(() => true)
            .catch(err => false);
    }

    async loadTokens(username, amount){
        amount = parseFloat(amount.toString().split(' ')[0]).toFixed(4);
        if(amount <= 0) throw new Error("Amount must be greater than 0");

        return eos.token.transfer(eos.account.name, 'ridlridlridl', `${amount} RIDL`, `${eos.account.name} ${username}`, eos.options)
            .then(res => res)
            .catch(err => false);
    }

    async identityBalance(username){
        return getIdentity(username).then(res => res.tokens).catch(() => null);
    }

    async getHash(name){ return await this.get(name).then(x => x ? x.hash : null); }
    async exists(name){ return await this.get(name).then(x => !!x); }
}