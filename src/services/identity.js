
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

    constructor(){
    	this.paymentSymbol = 'EOS';
	}

	setSymbol(symbol){
    	this.paymentSymbol = symbol;
	}


    validName(name){
        return /^[a-zA-Z0-9_-]{3,20}$/.test(name);
    }

    async get(name){
        return getIdentity(name);
    }

    async payAndIdentify(username, key){
        return eos.writer.transaction(['eosio.token', 'ridlridlridl'], contracts => {
            contracts.eosio_token.transfer(eos.account.name, 'ridlridlridl', `1.0000 ${this.paymentSymbol}`, '', eos.options);
            contracts.ridlridlridl.identify(eos.account.name, username, key, eos.options);
        })
    }

    async claim(username, key, signature){
        return eos.contract.claim(eos.account.name, username, key, signature, eos.options)
            .then(() => this.get(username))
            .catch(err => console.error(err));
    }

    async rekey(username, key){
        return eos.contract.rekey(username, key, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

    async setAccountFromAccount(username, account){
        return eos.contract.setaccacc(username, account, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

    async setAccountFromKey(username, account, signature){
        return eos.contract.setacckey(username, account, signature, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

    async release(username, signedHash){
        return eos.contract.release(username, signedHash, eos.options)
            .then(() => true)
            .catch(err => false);
    }

    async loadTokens(username, amount){
        amount = parseFloat(amount.toString().split(' ')[0]).toFixed(4);
        if(amount <= 0) throw new Error("Amount must be greater than 0");

		return eos.writer.transaction(['ridlridlcoin', 'ridlridlridl'], contracts => {
			contracts.ridlridlcoin.transfer(eos.account.name, 'ridlridlridl', `${amount} RIDL`, '', eos.options);
			contracts.ridlridlridl.loadtokens(eos.account.name, username, `${amount} RIDL`, eos.options);
		})
			.then(() => this.get(username))
			.catch(err => false);
    }

    async identityBalance(username){
        return getIdentity(username).then(res => res.tokens).catch(() => null);
    }

    async getHash(name){ return await this.get(name).then(x => x ? x.hash : null); }
    async exists(name){ return await this.get(name).then(x => !!x); }
}