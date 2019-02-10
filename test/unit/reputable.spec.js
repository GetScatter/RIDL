import { assert } from 'chai';
import 'mocha';

import {Reputation} from "../../src/models/Reputable";
import Reputable from "../../src/models/Reputable";

const buildFragment = p => {

	return {
		fingerprint: 3425667939,
		type: "social",
		up: `${Math.round(Math.random() * 20)}.0000 REP`,
		down: `${Math.round(Math.random() * 2)}.0000 REP`,
		reputation:p ? p : (Math.random() - Math.random()),
	};
};

let reputables = [
	Reputable.fromJson({
		entity:'1',
		reputation:Reputation.fromJson({
			fragments:[
				buildFragment(0.1111),
				buildFragment(0.221),
				buildFragment(-0.0554),
				buildFragment(-0.2111),
			]
		})
	}),
	Reputable.fromJson({
		entity:'2',
		reputation:Reputation.fromJson({
			fragments:[
				buildFragment(),
				buildFragment(),
				buildFragment(),
				buildFragment(),
			]
		})
	}),
	Reputable.fromJson({
		entity:'3',
		reputation:Reputation.fromJson({
			fragments:[
				buildFragment(),
				buildFragment(),
				buildFragment(),
				buildFragment(),
			]
		})
	}),
	Reputable.fromJson({
		entity:'4',
		reputation:Reputation.fromJson({
			fragments:[
				buildFragment(),
			]
		})
	}),
];




describe('Reputables', () => {

	it('should have averages and decimals', done => {
		new Promise(async() => {
			reputables.map(reputable => {
				console.log(`AVERAGE: ${reputable.averageReputation(true)} | DECIMAL: ${reputable.decimalReputation(true)} | PERCENTAGES: ${reputable.reputation.fragments.map(x => x.reputation).join(', ')}`);
			})
			done();
		})
	});

    // it('should setup ridl', done => {
    //     new Promise(async() => {
	//         await userAuth();
    //         done();
    //     })
    // });
	//
    // it('should have two identities to use', done => {
    //     new Promise(async() => {
    //         assert(!!await ridl.identity.get(username), "Username1 does not match or exist");
    //         assert(!!await ridl.identity.get(username2), "Username2 does not match or exist");
    //         done();
    //     })
    // });
	//
    // // it('should be able to get an entity reputation', done => {
    // //     new Promise(async() => {
    // //         reputable = await ridl.reputation.getEntity('app::fortnite');
    // //         done();
    // //     })
    // // })
	//
	// it('should have some rep types including based ones', done => {
	// 	new Promise(async() => {
	// 		fragTypes = await ridl.reputation.getFragmentsFor(reputable);
	// 		assert(fragTypes.length, "Could not get frag types, are you sure you initialized the contract properly?");
	// 		// assert(fragTypes.some(x => x.base === reputable.fingerprint), "Could not get based frag types, are you sure the entity has based frag types?");
	// 		done();
	// 	});
	// });
	//
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