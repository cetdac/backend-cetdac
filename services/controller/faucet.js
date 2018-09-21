const request = require('request-promise')
const conf = require('../config')
const util = require('../util/util')
const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');

let id = 1
const ethAddress = '0x83ff5040186119eaed65814dee5a1874629889af', ethPass = 'Siemenlon123'

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
      await web3.eth.personal.unlockAccount(ethAddress, ethPass, 600)
      ctx.status = 200
      ctx.body = util.jsonResponse(ctx.request, await web3.eth.sendTransaction({
        from: ethAddress,
        to: address,
        value: (1*1e18).toString()
      }))
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
  }
}