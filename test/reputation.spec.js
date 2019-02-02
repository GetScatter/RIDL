import ridl from '../src/ridl'
import { assert } from 'chai';
import 'mocha';

import Network from "../src/models/Network";

const host = `192.168.1.6`;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';
const network = Network.fromJson({ protocol:'http', port:8888, host, chainId, })

const contractKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const privateKey = '5KNNCwxjTeCvhz5tZdcphA1RCEvSduCDkmQSVKkZTQunSD9Jfxw';
const publicKey = 'EOS8YQzaYLxT17fWAPueQBxRjHehTQYZEvgPAWPPH4mAuwTJi3mPN';
const account = {name:'test1account', authority:'active'};
const username = 'helloworld';

const contractProvider = signargs => signargs.sign(signargs.buf, contractKey);
const userProvider = signargs => signargs.sign(signargs.buf, privateKey);

const contractAuth = () => ridl.init(network, {name:'ridlridlridl', authority:'active'}, contractProvider);
const userAuth =     () => ridl.init(network, account, userProvider);

describe('ReputationService', () => {

    let identity, reputation, reputable, fragTypes;

    it('should setup ridl', done => {
        new Promise(async() => {
	        await userAuth();
            done();
        })
    });

    it('should have an identity to use', done => {
        new Promise(async() => {
            identity = await ridl.identity.get(username);
            assert(identity && identity.username === username, "Username does not match or exist");
            done();
        })
    });

    it('should be able to get an entity reputation', done => {
        new Promise(async() => {
            reputable = await ridl.reputation.getEntity('app::fortnite');
            done();
        })
    })

	it('should have some rep types including based ones', done => {
		new Promise(async() => {
			fragTypes = await ridl.reputation.getFragmentsFor(reputable);
			assert(fragTypes.length, "Could not get frag types, are you sure you initialized the contract properly?");
			assert(fragTypes.some(x => x.base === reputable.fingerprint), "Could not get based frag types, are you sure the entity has based frag types?");
			done();
		});
	});

    it('should repute and become the mine owner', done => {
        new Promise(async() => {

            const fragments = [
                fragTypes[0].toFragment(0.1),
                fragTypes[1].toFragment(-0.1),
            ];

            await ridl.reputation.repute(username, 'app::domain.com', fragments);
	        const r = await ridl.reputation.getEntity('app::domain.com');
	        assert(r.miner === account.name, "Account was not made miner");

	        console.log(r);


            done();
        })
    });

    // it('should repute the original entity and pay taxes', done => {
    //     new Promise(async() => {
    //         const fragments = [
    //             new ReputationFragment('security', 4)
    //         ];
    //         const reputed = await ridl.reputation.repute(username2, 'url::domain.com', fragments);
    //         done();
    //     })
    // });
    //
    // it('should get the entity', done => {
    //     new Promise(async() => {
    //         userAuth();
    //         reputable = await ridl.reputation.getEntity('url::domain.com');
    //         assert(reputable, "Could not get entity");
    //         assert(reputable.entity === 'domain.com', "Could not get entity");
    //         done();
    //     })
    // });
    //
    // it('should get the entity\'s reputation', done => {
    //     new Promise(async() => {
    //         userAuth();
    //         reputation = await ridl.reputation.getEntityReputation('url::domain.com');
    //         done();
    //     })
    // });
    //
    // it('should remove the repute', done => {
    //     new Promise(async() => {
    //         userAuth();
    //         setTimeout(async () => {
    //             const reputed = await ridl.reputation.unrepute(username2, 'url::domain2.com');
    //             done();
    //         }, 200);
    //     })
    // });
    //
    // it('should repute and become the mine owner', done => {
    //     new Promise(async() => {
    //         const fragments = [
    //             new ReputationFragment('security', 1),
    //             new ReputationFragment('privacy', -1)
    //         ];
    //         const reputed = await ridl.reputation.repute(username, 'url::domain.com', fragments);
    //         done();
    //     })
    // });
    //
    // it('should repute and pay repute taxes', done => {
    //     new Promise(async() => {
    //         const fragments = [
    //             new ReputationFragment('security', 1),
    //             new ReputationFragment('privacy', 1)
    //         ];
    //         const reputed = await ridl.reputation.repute(username2, 'url::domain.com', fragments);
    //         done();
    //     })
    // });
    //
    // it('should release the identity', done => {
    //     new Promise(async() => {
    //         const release = async uname => {
    //             const hash = await ridl.identity.getHash(uname);
    //             const signedHash = ecc.Signature.signHash(hash, privateKey).toString();
    //             assert(await ridl.identity.release(uname, signedHash), "Identity was not released");
    //         };
    //
    //         await release(username);
    //         await release(username2);
    //         done();
    //     });
    // });
    //
    // it('should show the calculated reputation', () => {
    //     console.log('Reputable Entity', reputable);
    //     console.log('Entity Reputation', reputation);
    // })

});