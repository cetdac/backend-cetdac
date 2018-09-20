const bch = require('bitcoincashjs')
const bchaddr = require('bchaddrjs')
const request = require('request-promise')
const conf = require('../config')
const util = require('../util/util')

let id = 1

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
    return request(composeRpcData('sendtoaddress', [address, 0.1])).then(body => {
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
  },

  getEthBalance: async function(ctx, next) {
  }
}