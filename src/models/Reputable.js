export default class Reputable {
	constructor(){
		this.fingerprint = '';
		this.type = '';
		this.entity = '';
		this.miner = '';
		this.miner_til = -1;
		this.miner_frags = [];
		this.last_reputer = '';
		this.owner = '';
		this.total_rep = '';
	}

	static placeholder(){ return new Reputable(); }
	static fromJson(json){ return Object.assign(Reputable.placeholder(), json); }
}

export class Reputation {
	constructor(){
		this.fragments = [];
		this.total_reputes = 0;
	}

	static placeholder(){ return new Reputation(); }
	static fromJson(json){ return Object.assign(Reputation.placeholder(), json); }
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

	validate(){
		console.log(this);
		return (parseFloat(this.up.split(' ')[0]) > 0 || parseFloat(this.down.split(' ')[0]) > 0) &&
			this.type.toString().length &&
			this.fingerprint.toString().length
	}
}