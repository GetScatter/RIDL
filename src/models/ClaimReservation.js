export default class ClaimReservation {

    constructor(username = '', key = '', sig = '', account = ''){
        this.username = username;
        this.key = key;
        this.sig = sig;
        this.account = account;
    }

    static fromJson(json){
        return Object.assign(new ClaimReservation(), json);
    }

}