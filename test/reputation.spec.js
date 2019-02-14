import ridl, {FRAG_TYPES} from '../src/ridl'
import { assert } from 'chai';
import 'mocha';

import {
	userAuth,
	basicSetup,
	identitySetup,
	account2,
	account,
	username,
	username2,
	publicKey,
	network,
	contractAuth, forcetype
} from './_helpers'

describe('ReputationService', () => {

    let reputation, reputable, fragTypes;

	it('should setup ridl', done => {
		new Promise(async() => {
			await basicSetup();
			await identitySetup();
			await userAuth(account);
			fragTypes = await ridl.reputation.getFragmentsFor();
			assert(fragTypes.length, "Could not get frag types, are you sure you initialized the contract properly?");
			done();
		})
	});

	it('should create chained reputables', done => {
		new Promise(async() => {
			const fragments = [fragTypes[0].toFragment(1)];
			await ridl.reputation.repute(username, 0, 'eosio.system', FRAG_TYPES.BLOCKCHAIN_ADDR, fragments, network.id());
			reputable = await ridl.reputation.searchByFingerprint(FRAG_TYPES.BLOCKCHAIN_ADDR, 'eosio.system', network.id());
			assert(reputable, "Did not create eosio.system reputable.");

			const badfrags = [fragTypes.find(x => x.type === 'dangerous').toFragment(-1)];
			await ridl.reputation.repute(username, 0, 'updateauth', FRAG_TYPES.ACTION, badfrags, '', reputable.id);
			reputable = await ridl.reputation.searchByFingerprint(FRAG_TYPES.ACTION, 'updateauth', '', reputable.id);
			assert(reputable, "Did not create updateauth reputable.");
			assert(reputable.parent, "Updateauth reputable did not have a parent.");
			done();
		})
	});

	it('should pull parented frag types', done => {
		new Promise(async() => {
			await forcetype('tester', reputable.parent.id);
			const frags = await ridl.reputation.getFragmentsFor(reputable.parent);
			assert(frags.some(x => x.base === reputable.parent.id), "Could not get based frag types, are you sure the entity has based frag types?");
			done();
		})
	});



    it('should be able to get an entity reputation', done => {
        new Promise(async() => {
            reputable = await ridl.reputation.getEntity(1);
            assert(reputable, "Could not find reputable by fingerprint");
            done();
        })
    })

    it('should be able to search for an entity by name', done => {
        new Promise(async() => {
            const reputables = await ridl.reputation.searchForEntity('eosio.system');
	        assert(reputables.length, "Could not find reputable by name");
            done();
        })
    })

	it('should be able to get an entity reputation with parents', done => {
		new Promise(async() => {
			const parented = await ridl.reputation.getEntity(2);
			assert(parented, "Could not find reputable by fingerprint with parents");
			done();
		})
	})

	it('should be able to search for an entity by fingerprint', done => {
		new Promise(async() => {
			const found = await ridl.reputation.searchByFingerprint('acc', 'eosio.system', network.id());
			assert(found, "Could not find reputable by fingerprint");
			done();
		})
	})










    it('should repute and become the mine owner', done => {
        new Promise(async() => {
	        await userAuth(account);

            const fragments = [
                fragTypes[0].toFragment(0.1),
                fragTypes[1].toFragment(-0.1),
            ];

            await ridl.reputation.repute(username, 0, 'domain.com', FRAG_TYPES.APPLICATION, fragments);
	        const r = await ridl.reputation.searchByFingerprint(FRAG_TYPES.APPLICATION, 'domain.com');
	        assert(r.miner === account.name, "Account was not made miner");

            done();
        })
    });

    it('should repute with another account and give taxes to the mine owner', done => {
        new Promise(async() => {
	        await userAuth(account2);

	        const before = await ridl.identity.accountBalance(account.name, true);
            const fragments = [fragTypes[0].toFragment(0.1)];
	        await ridl.reputation.repute(username2, 0, 'domain.com', FRAG_TYPES.APPLICATION, fragments);
	        const after = await ridl.identity.accountBalance(account.name, true);

	        assert(before < after, "Did not send miner tax");
	        // console.log(`Miner tax was: ${parseFloat(after - before).toFixed(4)} RIDL`)

            done();
        })
    });

	it('should create a bunch of reputables', done => {
		new Promise(async() => {
			await userAuth(account);
			const fragments = [fragTypes[0].toFragment(1)];
			await ridl.reputation.repute(username, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, fragments, network.id());
			await ridl.reputation.repute(username, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, fragments);
			await ridl.reputation.repute(username, 0, 'scatterfunds', FRAG_TYPES.BLOCKCHAIN_ADDR, fragments);
			await ridl.reputation.repute(username, 0, 'get-scatter.com', FRAG_TYPES.APPLICATION, fragments);
			await ridl.reputation.repute(username, 0, 'gets-scatter.com', FRAG_TYPES.APPLICATION, [fragTypes.find(x => x.type === 'scam').toFragment(-1)]);
			await ridl.reputation.repute(username, 0, 'telosfoundation.io', FRAG_TYPES.APPLICATION, fragments);
			await ridl.reputation.repute(username, 0, 'telos-foundation.io', FRAG_TYPES.APPLICATION, [fragTypes.find(x => x.type === 'scam').toFragment(-1)]);

			await userAuth(account2);
			await ridl.reputation.repute(username2, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, fragments);
			await ridl.reputation.repute(username2, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, [fragTypes[1].toFragment(1)]);
			await ridl.reputation.repute(username2, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, [fragTypes[2].toFragment(-1)]);
			await ridl.reputation.repute(username2, 0, 'eosio.token', FRAG_TYPES.BLOCKCHAIN_ADDR, [fragTypes[3].toFragment(1)]);
			done();
		})
	});

});