
import * as eos from './eos'
import Identity from '../models/Identity'
import ClaimReservation from '../models/ClaimReservation'
import murmur from 'murmurhash';

const reservations = 'reservations';
const identities = 'identities';

const getIdentity = async (table, name) => {
    return await eos.read({
        table:table,
        index:murmur.v2(name),
        limit:1,
        model:Identity,
        firstOnly:true
    });
};

const possibleSuffixes = [ 'Rabbit', 'Rhino', 'Raccoon', 'Ragdoll', 'Rat', 'Robin', 'Royalty' ];

const randomSuffix = () => {
    const suffix = possibleSuffixes[Math.floor(Math.random() * possibleSuffixes.length)];
    const randomNumber = Math.floor(Math.random() * 10000000 + 1);
    return `${suffix}${randomNumber}`;
};

const generateRandomName = () => {
    const name = `Random${randomSuffix()}`;
    if(name.length > 20) return generateRandomName();
    return name;
};

export default class IdentityService {

    constructor(){}

    async randomName(){
        let name = generateRandomName();
        while(await this.exists(name))
            name = generateRandomName();
        return name;
    }

    async get(name){
        return getIdentity(identities, name);
    }

    async reservation(name){
        return getIdentity(reservations, name);
    }

    async identify(name, publicKey){
        return (await eos.write()).identify(name, publicKey, eos.authorization).then(() => {
            return this.get(name);
        }).catch(err => null);
    }

    async claim(name, signedSha256FromName, publicKey){
        const claim = new ClaimReservation(name, signedSha256FromName, publicKey);
        return (await eos.write()).claim({claim, wtv:''}, eos.authorization).then(() => {
            return this.get(name);
        }).catch(err => null);
    }

    async getHash(name){
        return await this.get(name).then(x => x ? x.hash : null)
            || await this.reservation(name).then(x => x ? x.hash : null);
    }

    async exists(name){
        return await this.get(name).then(x => !!x)
            || await this.reservation(name).then(x => !!x);
    }
}