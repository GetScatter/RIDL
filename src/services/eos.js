import Eos from 'eosjs';
import Network from '../models/Network';

const code = 'ridlridlridl';
const tokenCode = 'ridlridlcoin';

export let writer = null;
export let reader = null;
export let contract = null;
export let token = null;
export let options = {};
export let account = null;

/***
 * Can be initialized as a reader only.
 * @param network
 * @param _account
 * @param signProvider
 * @returns {Promise.<boolean>}
 */
export const init = async (network, _account = null, signProvider = null) => {
    network = Network.fromJson(network);
    if(!!_account) account = _account;

    reader = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});

    if(signProvider) {
        writer = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId, signProvider});
        contract = await writer.contract(code);
        token = await writer.contract(tokenCode);
    } else {
        writer = null;
        contract = null;
        token = null;
    }

    const baseOptions = {
        logger: {
            log: null,//console.log,
            error: null,//console.error
        }
    }

    options = Object.assign(baseOptions, !!_account ? { authorization:[`${_account.name}@${_account.authority}`] } : {});
    return true;
};

/***
 * Checks the connection to the network.
 * @returns {Promise.<*>}
 */
export const canConnect = async () => {
    const timeout = new Promise((r) => {setTimeout(() => r(false), 1500)});
    const contract = reader.getInfo({}).then(() => true).catch(() => false);
    return Promise.race([timeout, contract]);
};


export const read = async ({table, index, limit = 10, model = null, scope = code, firstOnly = false, rowsOnly = false}) => {
    const bounds = index ? {lower_bound:index, upper_bound:index+limit} : {};
    return await reader.getTableRows(Object.assign({ json:true, code, scope, table, limit }, bounds)).then(result => {
        if(model) result = format(result, model);
        if(firstOnly) return getFirstOnly(result);
        if(rowsOnly) return getRowsOnly(result);
        return result;
    });
};

const format = (result, model) => {
    result.rows = result.rows.map(model.fromJson);
    return result;
};

const getRowsOnly = result => result.rows;
const getFirstOnly = result => result.rows.length ? getRowsOnly(result)[0] : null;