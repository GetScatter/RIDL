import Network from "../src/models/Network";
import ridl from "../src/ridl";
import * as eos from "../src/services/eos";

export const network = Network.fromJson({
	host:'192.168.1.7',
	port:8888,
	protocol:'http',
	chainId:'6cbecff836a9fa60da53bf97a0a180103b2e76041d4414693d11bf39e2341547',
	blockchain:'eos',
});

// export const network = Network.fromJson({
// 	host:'ridlnet.get-scatter.com',
// 	port:80,
// 	protocol:'http',
// 	chainId:'6cbecff836a9fa60da53bf97a0a180103b2e76041d4414693d11bf39e2341547',
// 	blockchain:'eos',
// });

const contractKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
export const privateKey = '5KNNCwxjTeCvhz5tZdcphA1RCEvSduCDkmQSVKkZTQunSD9Jfxw';
export const publicKey = 'EOS8YQzaYLxT17fWAPueQBxRjHehTQYZEvgPAWPPH4mAuwTJi3mPN';
export const account = {name:'test1account', authority:'active'};
export const account2 = {name:'test2account', authority:'active'};
export const username = 'helloworld';
export const username2 = 'helloworld2';

const contractProvider = signargs => signargs.sign(signargs.buf, contractKey);
const userProvider = signargs => signargs.sign(signargs.buf, privateKey);

export const contractAuth = () => ridl.init(network, {name:'ridlridlridl', authority:'active'}, contractProvider);
export const userAuth =     (acc) => ridl.init(network, acc ? acc : account, userProvider);

const auth = {authorization:[`ridlridlridl@active`]};

export const forcetype = async (type, parent=0, upTag = "", downTag = "") => {
	await contractAuth();
	await eos.contract.forcetype(type, parent, upTag, downTag, auth);
	return true;
}

export const basicSetup = async () => {
	await contractAuth();
	await eos.contract.clean('eosio', auth);

	await forcetype("security", 0, "Secure", "Insecure");
	await forcetype("privacy", 0, "Discreet", "Indiscreet");
	await forcetype("scam", 0, "Trusted", "Scam");
	await forcetype("solvency", 0, "Solvent", "Insolvent");
	await forcetype("social", 0, "", "");
	await forcetype("dangerous", 0, "Safe", "Dangerous");
	await forcetype("accuracy", 0, "Accurate", "Inaccurate");
	await forcetype("rarity", 0, "Rare", "Common");
	await forcetype("fees", 0, "Low/No Fees", "High Fees");
	await forcetype("user experience", 0, "", "");
	await forcetype("code standards", 0, "Open Source", "Closed Source");

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
	return true;
}

export const testdata = async(id, rep, ridl) => {
	await contractAuth();
	await eos.contract.testdata(id, rep, ridl, auth);
	return true;
}