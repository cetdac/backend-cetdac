const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoinjs = require('bitcoinjs-lib')
const bech32 = require('bech32')
const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const cosmos = require('@cosmostation/cosmosjs')
const axios = require('./axios')

const Decimal = require('decimal.js')

const decimalNumber = 1e8

// const ApiURL = 'http://3.112.186.151:1317'

const chainId = "coinexdex-test2001";

const bech32MainPrefix = 'cettest'

const NodeApiUrl = 'http://47.75.119.206:1317/'

// const MNEMONIC = "damage hockey novel flip comfort fold tissue diesel proud party fancy nature";
const MNEMONIC = "eternal program pool capable front grunt disagree toy educate manage kick job";

const POOL_ADDRESS = getAddress(MNEMONIC)

const VALIDATOR_ADDRESS = 'cettestvaloper1337ry5hvgzg75a2hj9v0m9ead2n894l5alf7se'

const VOTETYPE={
  'vote':'cosmos-sdk/MsgDelegate',
  'unvote':'cosmos-sdk/MsgUndelegate'
}

class Wallet {
  async vote(type,pool_child_index,amount,isactive = true){
    let pool_child_address = this.getPoolChildAddress(pool_child_index)
    let transferamount = amount

    if (type == 'vote') {
      if (!isactive) { //地址未激活 需要一个CET激活  加手续费
        transferamount += 3
      } 
      await transfer(POOL_ADDRESS,pool_child_address,transferamount)
    }
    try {
      const data = (await axios.get(`${NodeApiUrl}auth/accounts/${pool_child_address}`)).result
      let stdSignMsg = NewStdMsg({
        type: VOTETYPE[type],
        delegator_address: pool_child_address,
        validator_address: VALIDATOR_ADDRESS,
        amountDenom: "cet",
        amount: new Decimal(amount).times(decimalNumber).toNumber(),
        feeDenom: "cet",
        fee: 3000000,
        gas: 150000,
        memo: "",
        account_number: data.account_number,
        sequence: data.sequence
      }) 
      
      const ecpairPriv = getECPairPriv(MNEMONIC,`m/44'/118'/0'/0/${pool_child_index}`)
      const signedTx = await sign(stdSignMsg,ecpairPriv)
      const tx_hash = await broadcast(signedTx)
      return tx_hash
     } catch (error) {
      throw new Error(error)
     }
  } 

  async reward(pool_child_index){
    const pool_address = this.getPoolChildAddress(pool_child_index)
    try {
      const data = await axios.get(`${NodeApiUrl}auth/accounts/${pool_address}`).result
      let stdSignMsg = NewStdMsg({
        type: 'cosmos-sdk/MsgWithdrawDelegationReward',
        delegator_address: pool_address,
        validator_address: VALIDATOR_ADDRESS,
        feeDenom: "cet",
        fee: 3000000,
        gas: 150000,
        memo: "",
        account_number: data.account_number,
        sequence: data.sequence
      }) 
      const ecpairPriv = getECPairPriv(MNEMONIC,`m/44'/118'/0'/0/${pool_child_index}`)
      const signedTx = await sign(stdSignMsg,ecpairPriv.privateKey)
      const tx_hash = await broadcast(signedTx)
      return tx_hash
    } catch (error) {
      throw new Error(error)
    }
  }

  async send(pool_child_index,to_address,amount){
    let pool_child_address = this.getPoolChildAddress(pool_child_index)

    try {
      const data = (await axios.get(`${NodeApiUrl}auth/accounts/${pool_child_address}`)).result
      let stdSignMsg = NewStdMsg({
        type: "bankx/MsgSend",
        from_address: pool_child_address,
        to_address: to_address,
        amountDenom: "cet",
        amount: amount*decimalNumber,		
        feeDenom: "cet",
        fee: 2000000,
        gas: 100000,
        memo: "",
        account_number: data.account_number,
        sequence: data.sequence
      }) 
      const ecpairPriv = getECPairPriv(MNEMONIC,`m/44'/118'/0'/0/${pool_child_index}`)
      const signedTx = await sign(stdSignMsg,ecpairPriv)
      const tx_hash = await broadcast(signedTx)
      return tx_hash
    } catch (error) {
      throw new Error(error)
    }
  }
  async getBalance(pool_child_index){
    const pool_address = this.getPoolChildAddress(pool_child_index)
    const data = await axios.get(`${NodeApiUrl}/bank/balances/${pool_address}`).result
    if (data.coins.length) {
      return await data.coins.find( item =>{
        if (item.denom == 'cet') {
          return item.amount
        }
      })
    } else {
      return 0
    }
  }

  getPoolChildAddress(pool_index){
    const seed = bip39.mnemonicToSeed(MNEMONIC);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(`m/44'/118'/0'/0/${pool_index}`);
    const words = bech32.toWords(child.identifier);
    return bech32.encode(bech32MainPrefix, words);
  }
}

async function transfer(from_address,to_address,amount){
  try {
    const data = (await axios.get(`${NodeApiUrl}auth/accounts/${from_address}`)).result
    let stdSignMsg = NewStdMsg({
      type: "bankx/MsgSend",
      from_address: from_address,
      to_address: to_address,
      amountDenom: "cet",
      amount: new Decimal(amount).times(decimalNumber).toNumber(),		
      feeDenom: "cet",
      fee: 2000000,
      gas: 100000,
      memo: "",
      account_number: data.account_number,
      sequence: data.sequence
    }) 
    const ecpairPriv = getECPairPriv(MNEMONIC)
    const signedTx = await sign(stdSignMsg,ecpairPriv)
    const tx_hash = await broadcast(signedTx)
    return tx_hash
  } catch (error) {
    throw new Error(error)
  }
  
} 

async function broadcast(tx){
  const data = (await axios.post(`${NodeApiUrl}txs`,tx))
  console.log('broadcast data',data)
  if (!data.code) {
    const tx_hash =  data.txhash
    return new Promise((resolve, reject) => {
      let times = 10
      let interval = setInterval(() => {
        times--
        if (times) {
          console.log(`${NodeApiUrl}txs/${tx_hash}`)
          axios.get(`${NodeApiUrl}txs/${tx_hash}`).then(res => {
            clearInterval(interval)
            if (!res.code) {
              resolve(tx_hash)
            }else{
              reject(res.raw_log)
            }
          }).catch(err => {
            console.log('get tx_hash error times',times)
          })
        } else {
          clearInterval(interval)
          reject('tx is notfound')
        }
      }, 2000);
    })
  }else if(/insufficient funds to pay for fees/i.test(data.raw_log)){
    console.log('insufficient funds to pay for fees')
    throw 'insufficient funds to pay for fees'
  } else {
    throw new Error(data.raw_log)
  }
}

function getAddress(mnemonic) {
  if (typeof mnemonic != "string") {
    throw new Error("mnemonic expects a string")
  }
  const seed = bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(`m/44'/118'/0'/0/0`);
  const words = bech32.toWords(child.identifier);
  return bech32.encode(bech32MainPrefix, words);
}

function getECPairPriv(mnemonic,path = `m/44'/118'/0'/0/0`) {
	if (typeof mnemonic !== "string") {
	    throw new Error("mnemonic expects a string")
	}
	const seed = bip39.mnemonicToSeed(mnemonic);
	const node = bip32.fromSeed(seed);
	const child = node.derivePath(path);
	const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey)
	return ecpair.privateKey;
}



function convertStringToBytes(str) {
  if (typeof str !== "string") {
      throw new Error("str expects a string")
  }
  var myBuffer = [];
  var buffer = Buffer.from(str, 'utf8');
  for (var i = 0; i < buffer.length; i++) {
      myBuffer.push(buffer[i]);
  }
  return myBuffer;
}

function getPubKeyBase64(ecpairPriv) {
  const pubKeyByte = secp256k1.publicKeyCreate(ecpairPriv);
  return Buffer.from(pubKeyByte, 'binary').toString('base64');
}

function sortObject(obj) {
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  sortedKeys.forEach(key => {
    result[key] = sortObject(obj[key])
  });
  return result;
}
function NewStdMsg(input){
  const stdSignMsg = new Object;
  if (input.type == "bankx/MsgSend") {
    stdSignMsg.json =
		{
			account_number: String(input.account_number),
			chain_id: chainId,
			fee: {
				amount: [
					{
						amount: String(input.fee),
						denom: input.feeDenom
					}
				],
				gas: String(input.gas)
			},
			memo: input.memo,
			msgs: [
				{
					type: input.type,
					value: {
						amount: [
							{
								amount: String(input.amount),
								denom: input.amountDenom
							}
						],
						from_address: input.from_address,
						to_address: input.to_address,
						unlock_time:"0"
					}
				}
			],
			sequence: String(input.sequence)
		}
  }else if (input.type == "cosmos-sdk/MsgDelegate") {
    stdSignMsg.json = 
    {
        account_number: String(input.account_number),
      chain_id: chainId,
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom
          }
        ],
        gas: String(input.gas)
      },
      memo: input.memo,
      msgs: [
        {
          type: input.type,
          value: {
            amount: {
              amount: String(input.amount),
              denom: input.amountDenom
            },
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ],
      sequence: String(input.sequence)
    }
  } else if (input.type == "cosmos-sdk/MsgUndelegate") {
    stdSignMsg.json = 
		{
		  	account_number: String(input.account_number),
			chain_id: chainId,
			fee: { 
				amount: [ 
					{ 
						amount: String(input.fee), 
						denom: input.feeDenom 
					} 
				], 
				gas: String(input.gas) 
			},
			memo: input.memo,
			msgs: [
				{ 
					type: input.type, 
					value: {
						amount: {
							amount: String(input.amount),
							denom: input.amountDenom
						},
						delegator_address: input.delegator_address,
						validator_address: input.validator_address
					}
				}
			],
			sequence: String(input.sequence) 
		}
  } else if (input.type == "cosmos-sdk/MsgWithdrawDelegationReward") {
    stdSignMsg.json = 
		{
		  account_number: String(input.account_number),
			chain_id: chainId,
			fee: { 
				amount: [ 
					{ 
						amount: String(input.fee), 
						denom: input.feeDenom 
					} 
				], 
				gas: String(input.gas) 
			},
			memo: input.memo,
			msgs: [
				{ 
					type: input.type, 
					value: {
						delegator_address: input.delegator_address,
						validator_address: input.validator_address
					}
				}
			],
			sequence: String(input.sequence) 
		}
    
  }
  stdSignMsg.bytes = convertStringToBytes(JSON.stringify(sortObject(stdSignMsg.json)));
  return stdSignMsg;
}

async function sign(stdSignMsg, ecpairPriv, modeType = "sync") {
    // The supported return types includes "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
  let signMessage = stdSignMsg.json;
  const hash = crypto.createHash('sha256').update(JSON.stringify(sortObject(signMessage))).digest('hex');
  const buf = Buffer.from(hash, 'hex');
  let signObj = secp256k1.sign(buf, ecpairPriv);
  var signatureBase64 = Buffer.from(signObj.signature, 'binary').toString('base64');
  let signedTx = new Object;
  signedTx = {
    "tx": {
        "msg": stdSignMsg.json.msgs,
        "fee": stdSignMsg.json.fee,
        "signatures": [{
          "signature": signatureBase64,
          "pub_key": {
              "type": "tendermint/PubKeySecp256k1",
              "value": getPubKeyBase64(ecpairPriv)
          }
        }],
        "memo": stdSignMsg.json.memo,
      },
      "mode": modeType
  }
  return signedTx;
}




module.exports = Wallet