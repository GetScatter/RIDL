import ridl from '../src/ridl'

import Eos from 'eosjs';
import ecc from 'eosjs-ecc';
import { assert } from 'chai';
import 'mocha';

const privateKey = '5KjbZQLH3EAfgXF3jejYM2WZjzJCUQH7NEkT1mVcBy2xoFdSWro';
const publicKey = 'EOS6TqXzpicna18dyRN3YoeLuviK3GJ3Geiid7TCfHCSZhXE49C44';

const signProvider = signargs => signargs.sign(signargs.buf, privateKey);
const selfAuth = {authorization:['ridl']};
const eos = Eos.Localnet({httpEndpoint:'http://192.168.56.101:8888', signProvider});
const _self = () => eos.contract('ridl');

describe('IdentityService', () => {

    const reservations = [
        {username:"hello",key:publicKey},
        {username:"helloa",key:publicKey}
    ];

    it('should clean up the contract', done => {
        new Promise(async() => {
            const self = await _self();
            await self.clean('', selfAuth);
            done();
        });
    })

    it('should insert some claimable reservations', done => {
        new Promise(async() => {
            const self = await _self();
            await self.seed({pairs:reservations}, selfAuth);
            reservations.map(async reservation => {
                assert(await ridl.identity.reservation(reservation), "Could not find reservation");
            });

            assert(!await ridl.identity.get(reservations[0]), "Found identity as reservation");
            done();
        });
    });

    it('should be able to get a hash for a reservation', done => {
        new Promise(async() => {
            const hash = await ridl.identity.getHash(reservations[0].username);
            assert(hash, "Could not get hash");
            done();
        });
    });

    it('should NOT be able to claim an identity that does not have a reservation', done => {
        new Promise(async() => {
            const identity = await ridl.identity.claim('non-existing',
                'SIG_K1_Jw2eBhZppnho6rKjN9qmuYrgoChn7H4gC9sQvxK3x7v2MWcUWXFTDzwkN7UwSaSrXM4GvgB46XRzZrhCsFWcVx4A11yS7m',
                publicKey).catch(()=>null);
            console.log('identity',identity);
            assert(!identity, "Identity cam back as non null");
            done();
        })
    });

    it('should be able to claim an identity from a reservation', done => {
        new Promise(async() => {
            const reservation = reservations[0];
            const username = reservation.username;
            const hash = await ridl.identity.getHash(username);
            const signedHash = ecc.Signature.signHash(hash, privateKey).toString();
            const identity = await ridl.identity.claim(username, signedHash, reservation.key);
            assert(identity, "Identity is still unclaimed");
            assert(identity.registered, "Identity is not registered");
            done();
        })
    });

    it('should be able to identify a non-registered identity', done => {
        new Promise(async() => {
            const username = await ridl.identity.randomName();
            const identity = await ridl.identity.identify(username, publicKey);
            assert(identity, "Identity is still unidentified");
            assert(!identity.registered, "Identity is registered");
            done();
        })
    });

    it('should NOT be able to identify a non-registered identity with a bad name', done => {
        new Promise(async() => {
            assert(!await ridl.identity.identify('xyz', publicKey), "Identity was identified");
            assert(!await ridl.identity.identify('RandomAbercad', publicKey), "Identity was identified");
            done();
        })
    });

});