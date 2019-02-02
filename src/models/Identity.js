export default class Identity {

    constructor(){
        this.fingerprint = '';
        this.username = '';
        this.key = '';
        this.account = '';
        this.expires = -1;
        this.tokens = null;
        this.total_rep = 0;
    }

	static placeholder(){ return new Identity(); }
	static fromJson(json){ return Object.assign(Identity.placeholder(), json); }

}