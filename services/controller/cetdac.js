const CETDacModel = require('../model/cetdac')

class cetdacController {
  async find(ctx){
    const data = await CETDacModel
      .find()
      .sort({ _id: -1 })
      
    ctx.res.ok({
      body:{
        data
      }
    })
  }

  async saveMessage (ctx) {
    let message = ctx.request.body
    if (!message.name) {
      ctx.res.fail({
        code: -1,
        message: 'name required'
      })
      return
    }
    if (!message.content) {
      ctx.res.fail({
        code: -1,
        message: 'content required'
      })
      return
    }
    message.time = new Date().getTime()
    await CETDacModel.insertOne(message)
    ctx.res.ok({
      body:{
        message
      }
    })
  }

}
module.exports = cetdacController