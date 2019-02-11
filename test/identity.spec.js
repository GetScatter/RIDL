import ridl from '../src/ridl'

import ecc from 'eosjs-ecc';
import * as eos from '../src/services/eos'
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
	contractAuth, forcetype, privateKey
} from './_helpers'
import {ridlCode} from "../src/services/eos";


describe('IdentityService', () => {

	it('should setup ridl', done => {
		new Promise(async() => {
			await basicSetup();
			await userAuth(account);
			done();
		})
	});



	it('should be able to pay for and identify an Identity in a single batch transaction', done => {
		new Promise(async() => {
			const identified = await ridl.identity.payAndIdentify(username, publicKey);
			const identity = await ridl.identity.get(username);
			assert(identity, "Did not create identity");
			assert(identity.account === account.name, "Incorrectly identified");
			assert(identity.tokens === '20.0000 RIDL', "Bad initial tokens");

			done();
		})
	});

	// IMPORTANT! Set contract TOPUP_DELAY to 1 second in [lib\common.h] for testing only
	it('should be able to load tokens into an identity', done => {
		new Promise(async() => {
			await ridl.identity.loadtokens(username, 50);
			setTimeout(async () => {
				const balance = await ridl.identity.identityBalance(username);
				assert(balance === '70.0000 RIDL', "Incorrect identity token balance first load");
				done();
            }, 2 * 1000);
		})
	});

	it('should be able to load more tokens into an identity than it can hold and be refunded the overflow', done => {
		new Promise(async() => {
		    const before = ridl.identity.accountBalance(account.name, true);
			await ridl.identity.loadtokens(username, 50);
			setTimeout(async () => {
				const balance = await ridl.identity.identityBalance(username);
				assert(balance === '100.0000 RIDL', "Incorrect identity overflow balance");
				const after = ridl.identity.accountBalance(account.name, true);
				assert(after === before-30, "Incorrect account return balance");
				done();
			}, 2 * 1000);
			done();
		})
	});

	it('should be able to re-key an identity', done => {
		new Promise(async() => {

			const keychange = await ridl.identity.changekey(username, 'EOS5AwwyqQTsrMTkBbGxkbJz9vMugi7d3zHBRiGvbWv1eU4dGYc4v');
			assert(keychange, "Identity was not retrieved changekey");
			assert(keychange.key === 'EOS5AwwyqQTsrMTkBbGxkbJz9vMugi7d3zHBRiGvbWv1eU4dGYc4v', "Identity was not rekeyed");

			// Resetting to key with configured private
			await ridl.identity.changekey(username, publicKey);

			done();
		})
	});

	it('should be able to change an identity\'s owner account', done => {
		new Promise(async() => {

			const accountchange = await ridl.identity.changeacc(username, account2.name);
			assert(accountchange, "Identity was not retrieved changeacc");
			assert(accountchange.account === account2.name, "Identity's account was not changed");

			// Resetting to key with configured private
            await userAuth(account2);
			const changeback = await ridl.identity.changeacc(username, account.name);
			assert(changeback.account === account.name, "Identity's account was not changed");
			await userAuth(account);

			done();
		})
	});


	const seededUsername = 'seeded';
    it('should insert some claimable reservations', done => {
        new Promise(async() => {
            await contractAuth();
            await eos.contract.seed(seededUsername, publicKey, eos.options);
            const identity = await ridl.identity.get(seededUsername);
            assert(identity, "Could not find seeded identity");
            assert(identity.account === ridlCode, "Identity is already claimed");
            done();
        });
    });

    it('should be able to claim an identity from a reservation', done => {
        new Promise(async() => {
            await userAuth();
            const signedHash = ecc.Signature.signHash(ecc.sha256('ridl'), privateKey).toString();
            const identity = await ridl.identity.claim(seededUsername, publicKey, signedHash);
            assert(identity, "Identity not retrieved");
            assert(identity.account === account.name, "Identity is not registered to the new account");
            done();
        })
    });




});