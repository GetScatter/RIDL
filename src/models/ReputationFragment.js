export default class ReputationFragment {

    constructor(type, fingerprint, weight){
        this.type = type;
        this.fingerprint = fingerprint;
        this.up = weight > 0 ? `${parseFloat(weight).toFixed(4)} RIDL` : '0.0000 RIDL';
        this.down = weight < 0 ? `${parseFloat(Math.abs(weight)).toFixed(4)} RIDL` : '0.0000 RIDL';
    }

    static placeholder(){ return new ReputationFragment('none', 0); }
    static fromJson(json){ return Object.assign(ReputationFragment.placeholder(), json); }

}