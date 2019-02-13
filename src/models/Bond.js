export default class Bond {
	constructor(){
		this.id = 0;
		this.identity = 0;
		this.title = '';
		this.details = '';
		this.start_time = 0;
		this.expires = 0;
		this.limit = null;
		this.votes = null;
		this.fixed_party = null;
	}

	static placeholder(){ return new Bond(); }
	static fromJson(json){ return Object.assign(Bond.placeholder(), json); }


}