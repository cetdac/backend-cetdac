const util = require('../util/util')
const schema = require('../module/schema')
const uuidv1 = require('uuid/v1')

module.exports = {

  create: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};
    return schema.Account.create({
        id: uuidv1(),
        //如果 id 变化
        id_in_app: ctx.request.body.id_in_app,
        short_name: ctx.request.body.short_name,
        first_name: ctx.request.body.first_name,
        last_name: ctx.request.body.last_name,
        birthday: ctx.request.body.birthday,
        gender: ctx.request.body.gender,
        avatar: ctx.request.body.avatar,
        provider: ctx.request.body.provider,
        mobile: ctx.request.body.mobile,
        emails: ctx.request.body.emails,
        from: ctx.request.body.from || 'chrome',
        status: 'available',
        create_time:new Date(),
        update_time:new Date()
      }).then(account=>{
        ctx.body = util.jsonResponse(ctx.request, {
          account: account
        })
      }).catch(e=>{
        //查找account失败
        console.error(e)
        ctx.body = util.jsonResponse(
          ctx.request,
          undefined,
          "CREATE_ACCOUNT_ERROR",
          e
        )
      })
  },

  update: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};
    let updateObject = {}
    for(let p in ctx.request.body){
      updateObject[p] = ctx.request.body[p]
    }
    return schema.Account.update(updateObject, {
        where:{
          id: ctx.params.id
        }
      }).then(() => {
        ctx.body = util.jsonResponse(ctx.request, {
          id: ctx.params.id
        })
    }).catch(e=>{
      //查找account失败
      console.error(e)
      ctx.body = util.jsonResponse(
        ctx.request,
        undefined,
        "UPDATE_ACCOUNT_ERROR",
        e
      )
    })
  },

  get: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};
    return schema.Account.findById(ctx.params.id).then(account=>{
      ctx.body = util.jsonResponse(ctx.request, {
        account: account
      })
    }).catch(e=>{
      //查找account失败
      console.error(e)
      ctx.body = util.jsonResponse(
        ctx.request,
        undefined,
        "GET_ACCOUNT_ERROR",
        e
      )
    })
  },

  createByProfile: async function(userProfile) {
    try{
      return schema.Account.create({
        id: uuidv1(),
        //如果 id 变化
        id_in_app: userProfile.id_in_app,
        short_name: userProfile.short_name,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        birthday: userProfile.birthday,
        gender: userProfile.gender,
        avatar: userProfile.avatar,
        provider: userProfile.provider,
        mobile: userProfile.mobile,
        emails: userProfile.emails,
        from: userProfile.from || 'chrome',
        status: 'available',
        create_time:new Date(),
        update_time:new Date()
      })
    }
    catch(e){
      console.error(e)
      ctx.body = util.jsonResponse(
        ctx.request,
        undefined,
        "CREATE_ACCOUNT_ERROR",
        e
      )
    }
  }
}