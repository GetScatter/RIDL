import ecc from 'eosjs-ecc';

export const fingerprinted = data => ecc.sha256(data);