import Network from "../src/models/Network";
import ridl from "../src/ridl";
import * as eos from "../src/services/eos";

const host = `192.168.1.6`;
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';
export const network = Network.fromJson({ protocol:'http', port:8888, host, chainId, })

const contractKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const privateKey = '5KNNCwxjTeCvhz5tZdcphA1RCEvSduCDkmQSVKkZTQunSD9Jfxw';
export const publicKey = 'EOS8YQzaYLxT17fWAPueQBxRjHehTQYZEvgPAWPPH4mAuwTJi3mPN';
export const account = {name:'test1account', authority:'active'};
export const account2 = {name:'test2account', authority:'active'};
export const username = 'helloworld';
export const username2 = 'helloworld2';

const contractProvider = signargs => signargs.sign(signargs.buf, contractKey);
const userProvider = signargs => signargs.sign(signargs.buf, privateKey);

export const contractAuth = () => ridl.init(network, {name:'ridlridlridl', authority:'active'}, contractProvider);
export const userAuth =     (acc) => ridl.init(network, acc ? acc : account, userProvider);

export const forcetype = async (type, parent=0) => {
	await contractAuth();
	const auth = {authorization:[`ridlridlridl@active`]};
	await eos.contract.forcetype(type, parent, "", "", auth);
	return true;
}

export const basicSetup = async () => {
	await contractAuth();
	const auth = {authorization:[`ridlridlridl@active`]};
	await eos.contract.clean('eosio', auth);

	const BASE_FRAGS = ['security', 'privacy', 'scam', 'solvency', 'social', 'dangerous'];
	await Promise.all(BASE_FRAGS.map(type => forcetype(type)));

	return true;
}

export const identitySetup = async() => {
	const createIdentity = async (acc, name) => {
		await userAuth(acc);
		await ridl.identity.payAndIdentify(name, publicKey);
		return true;
	};

	await createIdentity(account, username);
	await createIdentity(account2, username2);
}