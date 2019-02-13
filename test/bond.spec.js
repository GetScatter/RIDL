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
	contractAuth, forcetype, testdata
} from './_helpers'

describe('BondService', () => {

	const title = 'hello world';
	const description = 'some desc text';
	const duration = 2;
	const limit = '1.0000 REP';

	let id;

	it('should setup ridl', done => {
		new Promise(async() => {
			await basicSetup();
			await identitySetup();
			await testdata(1, '1000.0000 REP', '0.0000 RIDL');
			await testdata(2, '1000.0000 REP', '0.0000 RIDL');
			await userAuth(account);
			done();
		})
	});

	it('should be able to create a bond and get it by fingerprint', done => {
		new Promise(async() => {
			const result = await ridl.bond.createbond(username, title, description, duration, limit).catch(() => null);
			assert(result, "Could not insert bond");
			assert(result.title === title, "Could not insert bond");
			id = result.id;
			done();
		})
	});

	it('should not be able to close or erase a bond which has not yet expired', done => {
		new Promise(async() => {
			assert(!(await ridl.bond.closebond(id).catch(() => null)), "Closed unexpired bond");
			assert(!(await ridl.bond.erasebond(id).catch(() => null)), "Erased unexpired bond");
			done();
		})
	});

	it('should be able to get a bond by id', done => {
		new Promise(async() => {
			assert(await ridl.bond.get(id).catch(() => null), "Could not get bond by ID");
			done();
		})
	});

	it('should be able to get a list of bonds by identity id', done => {
		new Promise(async() => {
			const bonds = await ridl.bond.findBonds(1).catch(() => null);
			assert(bonds && bonds.length, "Could not get bonds by identity id");
			done();
		})
	});

	it('initial bond should be expired', done => {
		new Promise(async() => {
			setTimeout(async () => {
				// Deferred could fail, just making sure that isn't messing with the tests.
				await ridl.bond.closebond(id).catch(() => null);

				const bond = await ridl.bond.get(id).catch(() => null);
				assert(bond && bond.closed === 1, "Bond was not expired");
				done();
			}, duration*1000);
		})
	});

	it('initial bond should be erased', done => {
		new Promise(async() => {
			setTimeout(async () => {
				// Deferred could fail, just making sure that isn't messing with the tests.
				await ridl.bond.erasebond(id).catch(() => null);

				const bond = await ridl.bond.get(id).catch(() => null);
				assert(!bond, "Bond was not erased");
				done();
			}, duration*1000);
		})
	});

	it('should be able to create another bond', done => {
		new Promise(async() => {
			await userAuth(account2);
			const result = await ridl.bond.createbond(username2, title, description, 60*60, limit).catch(() => null);
			assert(result, "Could not insert bond");
			id = result.id;
			done();
		})
	});

	it('should be able to dispute a bond', done => {
		new Promise(async() => {
			await userAuth(account);
			const before = await ridl.identity.get(username2);
			const result = await ridl.bond.disputebond(username, id, '1.0000 REP').catch(() => null);
			assert(result, "Could not dispute bond");
			const after = await ridl.identity.get(username2);
			assert(parseFloat(after.usable_rep.split(' ')[0]) === (parseFloat(before.usable_rep.split(' ')[0]) - 1), "REP was not deducted.");
			done();
		})
	});



});