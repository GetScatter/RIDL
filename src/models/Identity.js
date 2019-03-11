export default class Identity {

    constructor(){
        this.id = -1;
        this.fingerprint = '';
        this.username = '';
        this.key = '';
        this.account = '';
        this.expires = -1;
        this.tokens = null;
        this.total_rep = 0;
        this.usable_rep = 0;
        this.expansion = null;
        this.bonded = null;
        this.created = 0;
    }

	static placeholder(){ return new Identity(); }
	static fromJson(json){ return Object.assign(Identity.placeholder(), json); }

	tokenCapacity(){
        const parse = x => parseFloat(x.split(' ')[0]);
        return `${parseFloat(100+(parseFloat(parse(this.expansion)+parse(this.bonded)+parse(this.usable_rep)))).toFixed(4)} RIDL`;
    }

}