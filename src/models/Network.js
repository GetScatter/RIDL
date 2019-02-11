export default class Network {
    constructor(_protocol = 'https', _host = '', _port = 0, chainId = ''){
        this.protocol = _protocol;
        this.host = _host;
        this.port = _port;
        this.chainId = chainId.toString();
    }

    static placeholder(){ return new Network(); }

    static fromJson(json){
        const p = Object.assign(Network.placeholder(), json);
        p.chainId = p.chainId ? p.chainId.toString() : '';
        return p;
    }

    hostport(){ return `${this.host}${this.port ? ':' : ''}${this.port}` }
    fullhost(){ return `${this.protocol}://${this.host}${this.port ? ':' : ''}${this.port}` }
	id(){ return `eos::${this.chainId}` }
}