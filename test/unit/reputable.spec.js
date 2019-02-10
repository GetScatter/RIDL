import { assert } from 'chai';
import 'mocha';

import {Reputation} from "../../src/models/Reputable";
import Reputable from "../../src/models/Reputable";

const buildFragment = p => {

	return {
		fingerprint: 3425667939,
		type: "social",
		// up: `${Math.round(Math.random() * 20)}.0000 REP`,
		// down: `${Math.round(Math.random() * 2)}.0000 REP`,
		up: `5.0000 REP`,
		down: `8.0000 REP`,
		reputation:p ? p : (Math.random() - Math.random()),
		timeScaledReputation:p ? p : (Math.random() - Math.random()),
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
				console.log(`AVERAGE: ${reputable.averageReputation(1)} | DECIMAL: ${reputable.decimalReputation(1)} | PERCENTAGES: ${reputable.reputation.fragments.map(x => x.reputation).join(', ')}`);
			})
			done();
		})
	});

});