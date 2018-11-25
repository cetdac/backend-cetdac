const request = require('request-promise')
const conf = require('../config')
const util = require('../util/util')
const Web3 = require('web3');
const web3 = new Web3('https://ethnode.bitapp.net.cn/ropsten');

const IPFS = require('ipfs')
const node = new IPFS()
const hash = 'QmXgZAUWd8yo4tvjBETqzUy3wLx5YRzuDwUQnBwRGrAmAo'

let id = 1
const ethAddress = '0x83ff5040186119eaed65814dee5a1874629889af',
keystore = '{"address":"83ff5040186119eaed65814dee5a1874629889af","crypto":{"cipher":"aes-128-ctr","ciphertext":"6b36de822bc5a844ee22fea2c5fc8dd921170292ded85a7f47b2950b3f501724","cipherparams":{"iv":"dbf10c31b764e1c7567a2ce68065f35d"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"6ff8e4f4efe3935734be4cbf5a40312b61bd131803584e143beafdade8184176"},"mac":"15a620ebd3c9ba6a9a7fd7a701d3c1aab50d156f79addccdcd72c315cf49d87b"},"id":"f9e9d790-2afb-43c7-af51-dbdadec61f08","version":3}',
password = 'Siemenlon123' 

const composeRpcData = function (method, params) {
  let body = {
    "jsonrpc": "2.0", 
    "method": method, 
    "params": params, 
    "id": id++ 
  }
  return {
    url : conf.rpc.url,
    method : 'post',
    headers : {
      'Content-type': 'application/json'
    },
    json: true,
    encoding: null,
    body: body
  }
}

module.exports = {
  getBch: async function(ctx, next) {
    const body = ctx.request.body
    let address = body.address
    return request(composeRpcData('sendtoaddress', [address, 1])).then(body => {
      ctx.status = 200
      ctx.body = util.jsonResponse(ctx.request, {txid: body.result})
    }).catch(e => {
      console.error(e)
      ctx.status = 500
      ctx.body = util.jsonResponse(ctx.request)
    })
  },

  getBchBalance: async function(ctx, next) {
    return request(composeRpcData('listunspent', [0, 99999999])).then(body => {
      ctx.status = 200
      let total = 0
      body.result.forEach(item=>{
        total += item.amount
      })
      ctx.body = util.jsonResponse(ctx.request, total)
    }).catch( e => {
      console.error(e)
      ctx.status = 500
      ctx.body = util.jsonResponse(ctx.request)
    })
  },

  getEth: async function(ctx, next) {
    try {
      const body = ctx.request.body
      const address = body.address
      const decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
      
      let signedTx = await decryptedAccount.signTransaction({
        from: ethAddress,
        to: address,
        value: (1*1e18).toString(),
        gas: 200000
      })
      ctx.status = 200
      ctx.body = util.jsonResponse(ctx.request, await web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    }
    catch(e){
      console.error(e)
      ctx.status = 500
      ctx.body = util.jsonResponse(ctx.request)
    }
  },

  getEthBalance: async function(ctx, next) {
    try {
      ctx.status = 200
      ctx.body = util.jsonResponse(ctx.request, await web3.eth.getBalance(ethAddress))
    }
    catch(e){
      console.error(e)
      ctx.status = 500
      ctx.body = util.jsonResponse(ctx.request)
    }
  },

  sendAbcUtxo: async function(ctx, next){
    const bch = require('bitcoincashjs')
    const address = ctx.params.address

    // const bchAbcFrom = {
    //   address: '1PqqnxQtdejnRUeCQaHnhgvWWvkDqjDevV',
    //   privKey: 'L3m26KTMvDsngDDTjCxREEmgaBQZmjyNrHhovBn6akKcJ9seRXGg'
    // }
    const bchAbcFrom = {
      address: '18mixfAQHkmGr1RaHiweR8UmycfY6HUByj',
      privKey: 'KwshVDJP34CB2EmtyKjeZaVbmTpEjxe5K9gKo9UhpxiQdDLyJWXV'
    }
    try{
      let res = await request.get('https://blockservice.bitapp.net.cn/api/utxo/bch/?net=mainnet&address='+bchAbcFrom.address, {json:true})
      let utxos = []
      if(res.data){
        let total = 0
        res.data.forEach(item=>{
          let ut = {
            address: bchAbcFrom.address,
            txId: item.tx_hash,
            outputIndex: item.tx_output_n,
            satoshis: item.value,
            script: bch.Script.buildPublicKeyHashOut(bchAbcFrom.address).toString(),
          }
          total += item.value
          utxos.push(ut)
        })

        const transaction = new bch.Transaction()
        .from(utxos)
        .to(address, 0.00005 * 1e8)
        .to(bchAbcFrom.address, total - 0.00006 * 1e8)
        .change(bchAbcFrom.address)
        .sign(bchAbcFrom.privKey)

        ctx.status = 200
        ctx.body = util.jsonResponse(ctx.request, transaction.toString())
      }
    }
    catch(e) {
      console.error(e)
      ctx.status = 500
      ctx.body = util.jsonResponse(ctx.request)
    }
  },

  ipfs: async function (ctx, next){
    const fileBuffer = await node.files.cat(hash)
    // console.log('Added file contents:', fileBuffer.toString())
    ctx.status = 200
    ctx.body = util.jsonResponse(ctx.request, fileBuffer.toString())
  }
}