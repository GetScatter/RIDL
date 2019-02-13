import * as eos from './eos'
import Bond from "../models/Bond";
import {fingerprinted} from "../util/helpers";

export default class BondService {

    constructor(){}

    async get(bond_id){
	    return await eos.read({
		    table:'bonds',
		    index:bond_id,
		    limit:1,
		    model:Bond,
		    firstOnly:true,
	    });
    }

    async findByFingerprint(title, details, username, limit, fixed_party){
	    return await eos.read({
		    table:'bonds',
		    key_type:'i64',
		    index_position:3,
		    index:fingerprinted(title+details+username+limit+fixed_party),
		    nobound:true,
		    limit:1,
		    model:Bond,
		    firstOnly:true,
	    });
    }

    async findBonds(identity_id){
	    return await eos.read({
		    table:'bonds',
		    key_type:'i64',
		    index_position:2,
		    index:identity_id,
		    limit:500,
		    model:Bond,
		    rowsOnly:true,
	    });
    }


    async createbond(username, title, details, duration, limit, starts_in_seconds = 0, fixed_party = 0){
	    return eos.contract.createbond(username, title, details, duration, starts_in_seconds, limit, fixed_party, eos.options)
		    .then(() => this.findByFingerprint(title,details,username, limit, fixed_party))
    }

    async disputebond(username, bond_id, rep = '1.0000 REP'){
	    return eos.contract.disputebond(username, bond_id, rep, eos.options)
    }

    async cancelbond(username, bond_id){
	    return eos.contract.cancelbond(username, bond_id, eos.options)
    }

    async closebond(bond_id){
	    return eos.contract.closebond(bond_id, eos.options)
    }

    async erasebond(bond_id){
	    return eos.contract.erasebond(bond_id, eos.options)
    }
}