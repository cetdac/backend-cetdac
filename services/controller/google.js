const util = require("../util/util"),
      config = require('../config'),
      request = require("request")
      
module.exports = {
  webhook_verify: async function(ctx, next) {
    ctx.status = 200;
    try{
      //'0d80ecfbde531ead31b81ca0df9bcce97fa43131'
      console.log(ctx.request.headers['X-Hub-Signature'])
      ctx.body = ctx.query['hub.challenge']
    }
    catch(e){
      console.error(e)
    }
  }
}