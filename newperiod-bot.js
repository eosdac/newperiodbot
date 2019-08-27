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
    name: 'newperiode',
    authorization: [{actor: auth_user, permission: auth_perm}],
    data: {message:'Automated newperiod', dac_id:config.dac_id}
};

const do_newperiod = async () => {
    try {
        const res = await api.transact({actions:[action]}, {blocksBehind: 3, expireSeconds: 30});

        console.log(res);

        // newperiod succeeded, send message to telegram bot
        if (config.bot_apiurl && config.bot_apikey){
            setTimeout(()=>{fetch(`${config.bot_apiurl}/newperiod/${config.bot_apikey}`)}, 6000 );
        }
    }
    catch (e){
        if (typeof e.json.error.details[0].message === 'string' && e.json.error.details[0].message.indexOf('NEWPERIOD_EARLY') === -1){
            console.error(e.json.error);
        }
    }
};


setInterval(do_newperiod, 60000);

do_newperiod();
