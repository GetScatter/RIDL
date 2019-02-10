import ridl from '../src/ridl'
import * as eos from '../src/services/eos'
import { assert } from 'chai';
import 'mocha';

import Network from "../src/models/Network";
import {Reputation} from "../src/models/Reputable";

const host = `192.168.1.6`;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';
const network = Network.fromJson({ protocol:'http', port:8888, host, chainId, })

const contractKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const privateKey = '5KNNCwxjTeCvhz5tZdcphA1RCEvSduCDkmQSVKkZTQunSD9Jfxw';
const publicKey = 'EOS8YQzaYLxT17fWAPueQBxRjHehTQYZEvgPAWPPH4mAuwTJi3mPN';
const account = {name:'test1account', authority:'active'};
const account2 = {name:'test2account', authority:'active'};
const username = 'helloworld';
const username2 = 'helloworld2';

const contractProvider = signargs => signargs.sign(signargs.buf, contractKey);
const userProvider = signargs => signargs.sign(signargs.buf, privateKey);

const contractAuth = () => ridl.init(network, {name:'ridlridlridl', authority:'active'}, contractProvider);
const userAuth =     (acc) => ridl.init(network, acc ? acc : account, userProvider);

describe('ReputationService', () => {

    let reputation, reputable, fragTypes;

    it('should setup ridl', done => {
        new Promise(async() => {
	        await userAuth();
            done();
        })
    });

    it('should have two identities to use', done => {
        new Promise(async() => {
            assert(!!await ridl.identity.get(username), "Username1 does not match or exist");
            assert(!!await ridl.identity.get(username2), "Username2 does not match or exist");
            done();
        })
    });

    it('should be able to get an entity reputation', done => {
        new Promise(async() => {
            reputable = await ridl.reputation.getEntity('acc::eosio.token', 'eos::cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f');
            assert(reputable, "Could not find reputable by fingerprint");
            done();
        })
    })

    it('should be able to search for an entity by name', done => {
        new Promise(async() => {
            const reputables = await ridl.reputation.searchForEntity('eosio.token');
	        assert(reputables.length, "Could not find reputable by name");
            done();
        })
    })

	it('should be able to get an entity reputation with parents', done => {
		new Promise(async() => {
			const parented = await ridl.reputation.getEntity('act::updateauth', '', 1);
			console.log('parented', parented);
			assert(parented, "Could not find reputable by fingerprint with parents");
			done();
		})
	})

	// it('should have some rep types including based ones', done => {
	// 	new Promise(async() => {
	// 		fragTypes = await ridl.reputation.getFragmentsFor(reputable);
	// 		assert(fragTypes.length, "Could not get frag types, are you sure you initialized the contract properly?");
	// 		// assert(fragTypes.some(x => x.base === reputable.fingerprint), "Could not get based frag types, are you sure the entity has based frag types?");
	// 		done();
	// 	});
	// });

    // it('should repute and become the mine owner', done => {
    //     new Promise(async() => {
	//         await userAuth();
	//
    //         const fragments = [
    //             fragTypes[0].toFragment(0.1),
    //             fragTypes[1].toFragment(-0.1),
    //         ];
	//
    //         await ridl.reputation.repute(username, 'app::domain.com', fragments);
	//         const r = await ridl.reputation.getEntity('app::domain.com');
	//         assert(r.miner === account.name, "Account was not made miner");
	//
	//
    //         done();
    //     })
    // });
	//
    // it('should repute with another account and give taxes to the mine owner', done => {
    //     new Promise(async() => {
	//         await userAuth(account2);
	//
	//         // const before = await eos.token.balan
    //         const before = await ridl.identity.balance(username);
	//
    //         const fragments = [
    //             fragTypes[0].toFragment(0.1),
    //             fragTypes[1].toFragment(-0.1),
    //         ];
	//
    //         await ridl.reputation.repute(username2, 'app::domain.com', fragments);
	//         const r = await ridl.reputation.getEntity('app::domain.com');
	//         assert(r.miner !== account2.name, "Account was not made miner");
	//
	//
	//         const after = await ridl.identity.balance(username);
	//
	//         console.log('before and after', before, after)
	//
    //         done();
    //     })
    // });

});