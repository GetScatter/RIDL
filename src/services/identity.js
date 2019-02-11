import * as eos from './eos'
import Identity from '../models/Identity'
import murmur from 'murmurhash';
import {RepType} from "../models/Reputable";

const fingerprinted = username => murmur.v2(username.toLowerCase());

const getIdentity = async (username) => {
    return await eos.read({
        table:'ids',
	    key_type:'i64',
	    index_position:3,
        index:fingerprinted(username),
        limit:1,
        model:Identity,
        firstOnly:true,
    });
};

export default class IdentityService {

    constructor(){
    	this.paymentSymbol = 'EOS';
	}

	setSymbol(symbol){ this.paymentSymbol = symbol; }
    validName(name){ return /^[a-zA-Z0-9_-]{3,20}$/.test(name); }

	/***
	 * Gets an identity based on a username
	 * @param username
	 * @returns {Promise<*>}
	 */
	async get(username){
        return getIdentity(username);
    }

	/***
	 * Pays for and identifies an identity
	 * @param username
	 * @param key
	 * @returns {Promise<*>}
	 */
	async payAndIdentify(username, key){
        return eos.writer.transaction(['eosio.token', 'ridlridlridl'], contracts => {
            contracts.eosio_token.transfer(eos.account.name, 'ridlridlridl', `1.0000 ${this.paymentSymbol}`, '', eos.options);
            contracts.ridlridlridl.identify(eos.account.name, username, key, eos.options);
        })
    }

	/***
	 * Changes the identity key
	 * @param username
	 * @param key
	 * @returns {Promise<T | boolean>}
	 */
	async rekey(username, key){
        return eos.contract.rekey(username, key, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

	/***
	 * Loads up RIDL tokens on the identity
	 * @param username
	 * @param amount
	 * @returns {Promise<T | boolean>}
	 */
	async topup(username, amount){
        amount = parseFloat(amount.toString().split(' ')[0]).toFixed(4);
        if(amount <= 0) throw new Error("Amount must be greater than 0");

		return eos.writer.transaction(['ridlridlcoin', 'ridlridlridl'], contracts => {
			contracts.ridlridlcoin.transfer(eos.account.name, 'ridlridlridl', `${amount} RIDL`, '', eos.options);
			contracts.ridlridlridl.topup(eos.account.name, username, `${amount} RIDL`, eos.options);
		})
			.then(() => this.get(username))
			.catch(err => false);
    }

	/***
	 * Claims a reserved identity
	 * @param username
	 * @param key
	 * @param signature
	 * @returns {Promise<T | void>}
	 */
	async claim(username, key, signature){
		return eos.contract.claim(eos.account.name, username, key, signature, eos.options)
			.then(() => this.get(username))
			.catch(err => console.error(err));
	}

	/***
	 * Get's an identity's RIDL balance
	 * @param username
	 * @returns {Promise<T | never>}
	 */
    async balance(username){
        return getIdentity(username).then(res => res.tokens).catch(() => null);
    }

    async exists(name){ return await this.get(name).then(x => !!x); }
}