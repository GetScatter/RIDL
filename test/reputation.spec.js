import ridl from '../src/ridl'
import ecc from 'eosjs-ecc';
import * as eos from '../src/services/eos'
import ReputationFragment from '../src/models/ReputationFragment'
import { assert } from 'chai';
import 'mocha';

import murmur from 'murmurhash';

const host = `192.168.1.7`;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';

const privateKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const publicKey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
const account = {name:'testacc', authority:'active'};
const account2 = {name:'ridlridlcoin', authority:'active'};

const signProvider = signargs => signargs.sign(signargs.buf, privateKey);

const contractAuth = () =>
    ridl.init({protocol:'http', host, port:8888, chainId}, {name:'ridlridlridl', authority:'active'}, signProvider);

const userAuth = (other = false) =>
    ridl.init({protocol:'http', host, port:8888, chainId}, !other ? account : account2, signProvider);

const username = 'ReputationTester';
const username2 = 'ReputationTester2';

describe('ReputationService', () => {

    // const now = Math.round(new Date()/1000);
    //
    // const fragHigh = 15043;
    // const fragLow = 2023;
    //
    // class Fragment {
    //     constructor(_up, _down){
    //         this.type = 'test';
    //         this.up = _up;
    //         this.down = _down;
    //     }
    //
    //     total(){
    //         return (this.up/fragHigh) - (this.down/fragLow);
    //     }
    // }
    //
    // it('should work', () => {
    //     console.log('test');
    //
    //     const fragment = new Fragment(9504, 419);
    //     console.log(fragment.up, fragment.down, fragment.total());
    // });






    let reputation, reputable;

    it('should clean the contract', done => {
        new Promise(async() => {
            await contractAuth();
            await eos.contract.clean({}, eos.options);
            done();
        });
    });

    it('should insert some forced rep types', done => {
        new Promise(async() => {
            await contractAuth();
            await eos.contract.forcetype('security', eos.options);
            await eos.contract.forcetype('privacy', eos.options);
            done();
        });
    });

    it('should set up an identity to use', done => {
        new Promise(async() => {
            await userAuth();
            await ridl.identity.payAndIdentify(username, publicKey);
            await ridl.identity.payAndIdentify(username2, publicKey);
            done();
        })
    });

    it('should repute and become the mine owner', done => {
        new Promise(async() => {
            console.log('bal1', await ridl.identity.identityBalance(username));
            console.log('bal1', await ridl.identity.identityBalance(username2));
            const fragments = [
                new ReputationFragment('security', 3),
                new ReputationFragment('privacy', -2)
            ];
            const reputed = await ridl.reputation.repute(username, 'url::domain.com', fragments);
            done();
        })
    });

    it('should repute another entity and become the mine owner', done => {
        new Promise(async() => {
            const fragments = [
                new ReputationFragment('security', 11),
                new ReputationFragment('privacy', -1)
            ];
            const reputed = await ridl.reputation.repute(username2, 'url::domain2.com', fragments);
            done();
        })
    });

    it('should repute the original entity and pay taxes', done => {
        new Promise(async() => {
            const fragments = [
                new ReputationFragment('security', 4)
            ];
            const reputed = await ridl.reputation.repute(username2, 'url::domain.com', fragments);
            done();
        })
    });

    it('should get the entity', done => {
        new Promise(async() => {
            userAuth();
            reputable = await ridl.reputation.getEntity('url::domain.com');
            assert(reputable, "Could not get entity");
            assert(reputable.entity === 'domain.com', "Could not get entity");
            done();
        })
    });

    it('should get the entity\'s reputation', done => {
        new Promise(async() => {
            userAuth();
            reputation = await ridl.reputation.getEntityReputation('url::domain.com');
            done();
        })
    });

    it('should remove the repute', done => {
        new Promise(async() => {
            userAuth();
            setTimeout(async () => {
                const reputed = await ridl.reputation.unrepute(username2, 'url::domain2.com');
                done();
            }, 200);
        })
    });

    it('should repute and become the mine owner', done => {
        new Promise(async() => {
            const fragments = [
                new ReputationFragment('security', 1),
                new ReputationFragment('privacy', -1)
            ];
            const reputed = await ridl.reputation.repute(username, 'url::domain.com', fragments);
            done();
        })
    });

    it('should repute and pay repute taxes', done => {
        new Promise(async() => {
            const fragments = [
                new ReputationFragment('security', 1),
                new ReputationFragment('privacy', 1)
            ];
            const reputed = await ridl.reputation.repute(username2, 'url::domain.com', fragments);
            done();
        })
    });

    it('should release the identity', done => {
        new Promise(async() => {
            const release = async uname => {
                const hash = await ridl.identity.getHash(uname);
                const signedHash = ecc.Signature.signHash(hash, privateKey).toString();
                assert(await ridl.identity.release(uname, signedHash), "Identity was not released");
            };

            await release(username);
            await release(username2);
            done();
        });
    });

    it('should show the calculated reputation', () => {
        console.log('Reputable Entity', reputable);
        console.log('Entity Reputation', reputation);
    })

});