export default class Reputable {
	constructor(){
		this.id = -1;
		this.type = '';
		this.entity = '';
		this.base = '';
		this.fingerprint = '';
		this.last_reputer = '';
		this.last_repute_time = +new Date();
		this.owner = '';
		this.network = '';
		this.block = 0;

		this.reputation = null;
		this.parent = null;
		this.children = [];
	}

	static placeholder(){ return new Reputable(); }
	static fromJson(json){
		let p = Object.assign(Reputable.placeholder(), json);
		if(json.hasOwnProperty('reputation')) p.reputation = Reputation.fromJson(json.reputation);
		if(json.hasOwnProperty('parent') && json.parent) p.parent = Reputable.fromJson(json.parent);
		if(json.hasOwnProperty('children') && json.children.length) p.children = json.children.map(x => Reputable.fromJson(x));
		return p;
	}
	clone(){ return Reputable.fromJson(JSON.parse(JSON.stringify(this))) }

	readableType(type = null){
		switch(type ? type : this.type){
			case 'acc': return 'Account / Address';
			case 'app': return 'Application';
			case 'id': return 'Identity';
			case 'act': return 'Contract Action';
			case 'etc': return 'Other';
		}
	}

	averageReputation(localized = false, fingerprintFilters = null, withScaling = true){
		if(!this.reputation) return 0;

		const fragments = !fingerprintFilters
			? this.reputation.fragments
			: this.reputation.fragments.filter(x => fingerprintFilters.includes(x.fingerprint));

		if(!fragments.length) return 0;

		if(!localized){
			return parseFloat((fragments.reduce((acc,x) => {
				acc += parseFloat(withScaling ? x.timeScaledReputation : x.reputation);
				return acc;
			}, 0)) / fragments.length).toFixed(4);
		}

		const up = fragments.reduce((acc,x) => { acc+=parseFloat(x.up.split(' ')[0]); return acc;}, 0);
		const down = fragments.reduce((acc,x) => { acc+=parseFloat(x.down.split(' ')[0]); return acc;}, 0);

		return parseFloat((up-down)/(up+down)).toFixed(4);

	}

	decimalReputation(localized = false, fingerprintFilters = null, max = 5, withScaling = true){
		const average = this.averageReputation(localized, fingerprintFilters, withScaling);
		const decimal = average * (localized ? max : max*2);
		return parseFloat(decimal > max ? max : decimal < -max ? -max : decimal).toFixed(1);
	}
}

export class Reputation {
	constructor(){
		this.fragments = [];
		this.total_reputes = 0;
	}

	static placeholder(){ return new Reputation(); }
	static fromJson(json){ return Object.assign(Reputation.placeholder(), json); }
	clone(){ return Reputation.fromJson(JSON.parse(JSON.stringify(this))) }
}

export class RepType {
	constructor(){
		this.fingerprint = '';
		this.type = '';
		this.base = 0;
		this.upTag = 'Good';
		this.downTag = 'Bad';
	}

	static placeholder(){ return new RepType(); }
	static fromJson(json){ return Object.assign(RepType.placeholder(), json); }
	clone(){ return RepType.fromJson(JSON.parse(JSON.stringify(this))) }
	toFragment(weight){
		return new Fragment(this.type, weight, this.fingerprint);
	}
}

export class Fragment {
	constructor(type, weight, fingerprint = ''){
		this.type = type;
		this.up = weight > 0 ? `${parseFloat(weight).toFixed(4)} RIDL` : '0.0000 RIDL';
		this.down = weight < 0 ? `${parseFloat(Math.abs(weight)).toFixed(4)} RIDL` : '0.0000 RIDL';
		this.fingerprint = fingerprint;
	}

	static placeholder(){ return new Fragment('none', 0); }
	static fromJson(json){ return Object.assign(Fragment.placeholder(), json); }
	clone(){ return Fragment.fromJson(JSON.parse(JSON.stringify(this))) }

	validate(){
		return (parseFloat(this.up.split(' ')[0]) > 0 || parseFloat(this.down.split(' ')[0]) > 0) &&
			this.type.toString().length &&
			this.fingerprint.toString().length
	}
}