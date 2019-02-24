import * as eos from './eos'
import Identity from '../models/Identity'
import {RepType} from "../models/Reputable";
import {tokenCode} from "./eos";
import {ridlCode} from "./eos";
import {fingerprinted} from "../util/helpers";

const getIdentity = async (username) => {
    return await eos.read({
        table:'ids',
	    key_type:'i64',
	    index_position:2,
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

    async getById(id){
	    return await eos.read({
		    table:'ids',
		    index:id,
		    limit:1,
		    model:Identity,
		    firstOnly:true,
	    });
    }

    async getByAccount(accountName){
	    return await eos.read({
		    table:'ids',
		    key_type:'i64',
		    index_position:3,
		    index:accountName,
		    limit:1,
		    model:Identity,
		    firstOnly:true,
	    });
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
	async changekey(username, key){
        return eos.contract.changekey(username, key, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

	/***
	 * Changes the identity account
	 * @param username
	 * @param key
	 * @returns {Promise<T | boolean>}
	 */
	async changeacc(username, newAccountName){
        return eos.contract.changeacc(username, newAccountName, eos.options)
            .then(() => this.get(username))
            .catch(err => false);
    }

	/***
	 * Loads up RIDL tokens on the identity
	 * @param username
	 * @param amount
	 * @returns {Promise<T | boolean>}
	 */
	async loadtokens(username, amount){
        amount = parseFloat(amount.toString().split(' ')[0]).toFixed(4);
        if(amount <= 0) throw new Error("Amount must be greater than 0");

		return eos.writer.transaction([tokenCode, ridlCode], contracts => {
			contracts[tokenCode].transfer(eos.account.name, ridlCode, `${amount} RIDL`, '', eos.options);
			contracts[ridlCode].loadtokens(username, `${amount} RIDL`, eos.options);
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

    async identityBalance(username){
        return getIdentity(username).then(res => res.tokens).catch(() => null);
    }

    async accountBalance(name, asFloat = false){
	    return await eos.read({
		    token:true,
		    table:'accounts',
		    scope:name,
		    limit:1,
		    firstOnly:true,
	    }).then(x => asFloat ? parseFloat(x.balance.split(' ')[0]) : x.balance);
    }

    async exists(name){ return await this.get(name).then(x => !!x); }
}