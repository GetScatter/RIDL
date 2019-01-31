import ridl from '../src/ridl'
import { assert } from 'chai';
import 'mocha';

import murmur from 'murmurhash';

const host = `192.168.1.6`;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';

const signProvider = () => null;


describe('Test', () => {


    let reputation, reputable;

    it('should setup ridl', done => {
        new Promise(async() => {
            await ridl.init({protocol:'http', host, port:8888, chainId}, {name:'ridlridlridl', authority:'active'}, signProvider);
            done();
        })
    })

    it('should get the fragments', done => {
        new Promise(async() => {
            console.log('global', await ridl.reputation.getFragments());
            console.log('based', await ridl.reputation.getFragments('app:fortnite'));
            done();
        })
    });

});