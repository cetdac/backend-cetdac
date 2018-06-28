const util = require('../util/util')
const schema = require('../db/schema')

module.exports = {
  //post
  create: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};
    return schema.Account.create({
        country_key: ctx.request.body.country_key,
        mobile: ctx.request.body.mobile,
        email: ctx.request.body.email,
        email_verified: 0,
        keychain: keychain,
        guid: Guid.create().value,
        key:key, 
        encrypted_master_seed: util.cipher(config.encryptAlgorithm, key, ctx.request.body.encrypted_master_seed)
      }).then(account=>{
      ctx.body = util.jsonResponse(ctx.request, {
        account: account
      });
      resolve(account);
    }).catch(e=>{
      //查找account失败
      console.error(e);
      ctx.body = util.jsonResponse(
        ctx.request,
        undefined,
        "CREATE_ACCOUNT_ERROR",
        e
      );
      reject(e);
    })
  }
}