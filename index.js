const config = require('./config');

const {Api, JsonRpc} = require('eosjs');
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const {TextEncoder, TextDecoder} = require('util');


const signatureProvider = new JsSignatureProvider.default([config.private_key]);
const rpc = new JsonRpc(config.endpoint, {fetch});
const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});


const cust_contract = config.contract;
const auth_user = config.auth_user;
const auth_perm = config.auth_perm;

const action = {
    account: cust_contract,
    name: 'newperiod',
    authorization: [{actor: auth_user, permission: auth_perm}],
    data: {'message':'Automated newperiod'}
};

const do_newperiod = async () => {
    try {
        const res = await api.transact({actions:[action]}, {blocksBehind: 3, expireSeconds: 30});

        console.log(res);
    }
    catch (e){
        console.log(e.json.error);
    }
};


setInterval(do_newperiod, 60000);

do_newperiod();
