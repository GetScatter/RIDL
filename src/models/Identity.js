export default class Identity {

    constructor(username, publicKey){
        this.username = username;
        this.key = publicKey;
        this.hash = '';
        this.registered = 0;
    }

    static fromJson(json){
        return Object.assign(new Identity(), json);
    }

}