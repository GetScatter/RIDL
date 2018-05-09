export default class ClaimReservation {

    constructor(username = '', sig = '', key = ''){
        this.username = username;
        this.sig = sig;
        this.key = key;
    }

    static fromJson(json){
        return Object.assign(new ClaimReservation(), json);
    }

}