import Eos from 'eosjs';

const getNetwork = () => {
    //TODO: decentralize
    return 'http://192.168.56.101:8888';
};

const code = 'ridl';

export const authorization = {authorization:['ridlpublic']};
const signProvider = signargs => {
    // Publicly visible stake only account
    return signargs.sign(signargs.buf, '5K92JPHddxyGVFx81jx7rgvjNZPxQzQz33ZqYzFwjfnPX8bbdKz');
};

const getEos = () => Eos.Localnet({httpEndpoint:getNetwork(), signProvider});
export const write = async () => getEos().contract(code);
export const read = async ({table, index, limit = 10, model = null, scope = 'ridl', firstOnly = false, rowsOnly = false}) => {
    const bounds = index ? {lower_bound:index, upper_bound:index+limit} : {};
    return await getEos().getTableRows(Object.assign({ json:true, code, scope, table, limit }, bounds)).then(result => {
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