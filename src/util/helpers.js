import murmur from 'murmurhash';
export const fingerprinted = data => murmur.v2(data);