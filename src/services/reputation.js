import * as eos from './eos'
import {Fragment, RepType, Reputation} from "../models/Reputable";
import Reputable from "../models/Reputable";
import {fingerprinted} from "../util/helpers";

let repTotalCache = {};

const getReputations = async reputables => {
	await Promise.all(reputables.map(async reputable => {
		reputable.reputation = await getReputation(reputable);
		return true;
	}));
	repTotalCache = {};
	return true;
}

const getReputation = async reputable => {
	const reputation = await eos.read({
		table:'reputations',
		scope:reputable.id,
		limit:1,
		firstOnly:true
	}).catch(() => null);

	if(!reputation) return Reputation.placeholder();

	const fragTotals = await Promise.all(reputation.fragments.map(async x => {

		if(repTotalCache.hasOwnProperty(x.fingerprint)) return repTotalCache[x.fingerprint];

		const rep = eos.read({
			table:'fragtotal',
			scope:x.fingerprint,
			limit:1,
			firstOnly:true
		}).catch(() => null);

		if(rep) repTotalCache[x.fingerprint] = rep;
		return rep;
	}));

	const parseAsset = asset => parseFloat(asset.split(' ')[0]);

	reputation.fragments.map(frag => {
		const fragTotal = fragTotals.find(x => x.type === frag.type);
		frag.reputation = 0;

		const up = parseAsset(frag.up);
		const down = parseAsset(frag.down);
		const tup = parseAsset(fragTotal.up);
		const tdown = parseAsset(fragTotal.down);

		// TODO: Might be an issue here.
		frag.reputation = ((up > 0 ? (up/tup) : 0) - (down > 0 ? (down/tdown) : 0));

		const timeMod = (Math.floor(+new Date()/1000) - reputable.last_repute_time) / 100000000;
		if(frag.reputation > 0 && frag.reputation - timeMod > frag.reputation/2) frag.timeScaledReputation = frag.reputation - timeMod;
		else if(frag.reputation < 0 && frag.reputation + timeMod < frag.reputation/2) frag.timeScaledReputation = frag.reputation + timeMod;
		else frag.timeScaledReputation = frag.reputation;

		frag.reputation = parseFloat(frag.reputation).toFixed(4);
		frag.timeScaledReputation = parseFloat(frag.timeScaledReputation).toFixed(4);
		frag.fingerprint = fragTotal.fingerprint;
	});

	delete reputation.id;
	return Reputation.fromJson(reputation);
}

const getParents = async (reputable, last = null) => {
	if(reputable.base === 0) return true;
	if(last && last.base === 0) return true;

	const parent = await eos.read({
		table:'reputables',
		index:last ? last.base : reputable.base,
		limit:1,
		firstOnly:true,
		model:Reputable
	}).catch(() => null);

	if(last) last.parent = parent;
	else reputable.parent = parent;

	return await getParents(reputable, parent);
};

export default class ReputationService {

    constructor(){}

	async repute(username, id = 0, entity, type, fragments, network = "", parent = '', details = ""){
    	if(entity.indexOf('::') > -1) throw new Error('Entities can not have "::" in them.');

		if (parent instanceof Reputable) parent = parent.id === -1
			? `fingerprint::${parent.entity}::${parent.type}::${parent.network}`
			: `id::${parent.id}`;
		else if(typeof parent === 'number') parent = `id::${parent}`;
		else if(typeof parent === 'string' && parent.toString().length > 0 && parent.indexOf('::') > -1)parent = `fingerprint::${parent}`;


        if(!fragments.every(frag => frag instanceof Fragment && frag.validate())) throw new Error('Invalid fragments');
        return eos.contract.repute(username, id, entity, type, fragments, network, parent, details, eos.options);
    }

    async votetype(username, type){
        return eos.contract.votetype(username, type, eos.options);
    }

    async getEntity(id){

        const reputable = await eos.read({
	        table:'reputables',
	        index:id,
	        limit:1,
	        firstOnly:true,
            model:Reputable
        }).catch(() => null);

        if(!reputable) return null;

        await getReputations([reputable]);
        await getParents(reputable);

        return reputable;
    }

    async searchForEntity(name){

        const reputables = await eos.read({
	        table:'reputables',
	        index:fingerprinted(name),
	        key_type:'i64',
	        index_position:2,
	        limit:500,
	        rowsOnly:true,
            model:Reputable
        }).catch(() => []);

        if(reputables.length) {
	        await getReputations(reputables);
	        await Promise.all(reputables.map(reputable => getParents(reputable)));
        }

        return reputables;
    }

    async searchByFingerprint(type = '', entity = '', network = '', base = 0){

        const reputable = await eos.read({
	        table:'reputables',
	        index:fingerprinted(type+entity+network+base),
	        key_type:'i64',
	        index_position:3,
	        limit:1,
	        firstOnly:true,
            model:Reputable
        }).catch(() => null);

	    if(!reputable) return null;

	    await getReputations([reputable]);
	    await getParents(reputable);

	    return reputable;
    }

    async getFragments(base = 0){
        return eos.read({
	        table:'reptypes',
	        key_type:'i64',
	        index_position:2,
	        index:base,
            search:1,
	        limit:100,
            rowsOnly:true,
	        model:RepType
        }).catch(() => []);
    }

    async getFragmentsFor(reputable = null){
        const globalFragments = await this.getFragments();
        const basedFragments = reputable ? (await this.getFragments(reputable.id)).map(x => {
            x.isBased = true;
            return x;
        }) : [];
        return globalFragments.concat(basedFragments);
    }
}