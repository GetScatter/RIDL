import ridl, {FRAG_TYPES} from '../src/ridl'
import { assert } from 'chai';
import 'mocha';
import {network} from "./_helpers";


describe('Test', () => {


	it('should setup ridl', done => {
		new Promise(async() => {
			await ridl.init(network);
			const test = await ridl.identity.getTopup('helloworld5');
			console.log('test', test);

			done();
		})
	});


});