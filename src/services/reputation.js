import * as eos from './eos'
import murmur from 'murmurhash';
import {Fragment, RepType, Reputation} from "../models/Reputable";
import Reputable from "../models/Reputable";

const fingerprinted = str => murmur.v2(str);

const getReputation = async reputable => {
	const reputation = await eos.read({
		table:'reputations',
		scope:fingerprinted(`${reputable.type}::${reputable.entity}`),
		limit:1,
		firstOnly:true
	}).catch(() => null);

	const fragTotals = await Promise.all(reputation.fragments.map(async x => {
		return eos.read({
			table:'fragtotal',
			scope:fingerprinted(x.type),
			limit:1,
			firstOnly:true
		}).catch(() => null);
	}));

	const parseAsset = asset => parseFloat(asset.split(' ')[0]);

	reputation.fragments.map(frag => {
		const fragTotal = fragTotals.find(x => x.type === frag.type);
		frag.reputation = 0;

		const up = parseAsset(frag.up);
		const down = parseAsset(frag.down);
		const tup = parseAsset(fragTotal.up);
		const tdown = parseAsset(fragTotal.down);

		frag.reputation = parseFloat(((up > 0 ? (up/tup) : 0) - (down > 0 ? (down/tdown) : 0)).toFixed(4));
		frag.fingerprint = fragTotal.fingerprint;
	});

	delete reputation.fingerprint;
	return Reputation.fromJson(reputation);
}

export default class ReputationService {

    constructor(){}

    async repute(username, entity, fragments, details = ''){
        if(!username.length) throw new Error('Invalid username');
        if(!entity.length || entity.indexOf('::') === -1) throw new Error('Invalid entity');
        if(!fragments.every(frag => frag instanceof Fragment && frag.validate())) throw new Error('Invalid fragments');
        return eos.contract.repute(username, entity, fragments, details, eos.options);
    }

    async votetype(username, type){
        return eos.contract.votetype(username, type, eos.options);
    }

    async getEntity(entity){

        const reputable = await eos.read({
	        table:'reputables',
	        index:fingerprinted(entity),
	        limit:1,
	        firstOnly:true,
            model:Reputable
        }).catch(() => null);

        if(reputable) reputable.reputation = await getReputation(reputable);

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
        }).catch(() => null);

        if(reputables.length) {
        	await Promise.all(reputables.map(async reputable => {
		        reputable.reputation = await getReputation(reputable);
		        return true;
	        }));
        }

        return reputables;
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
        const basedFragments = reputable ? (await this.getFragments(reputable.fingerprint)).map(x => {
            x.isBased = true;
            return x;
        }) : [];
        return globalFragments.concat(basedFragments);
    }
}