const { RecordModel,ContrastModel,CountersModel, RedeemModel} = require('../model/pool')
const { queryToPagination } = require('../util/util')
const Decimal = require('decimal.js')
const axios = require('../module/axios')

const Wallet = require('../module/wallet')
const wallet = new Wallet()

class PoolController {
  async recordSave(ctx) {
    let param = ctx.request.body
    let ret = await ContrastModel.findOne({address:param.address})
    try {
      if (param.type == 1) { //投票
        if (ret) { // 有记录
          let tempamount = new Decimal(param.amount) 
          await ContrastModel.updateOne({
            address:param.address
          },{
            $set: {
              amount: tempamount.plus(ret.amount)
            }
          })
          param.pool_tx_hash = await wallet.vote('vote',ret.pool_index,param.amount)
        } else { // 无记录
          let contrast = {}
          contrast.address = param.address
          contrast.amount = param.amount
          contrast.pool_index = await getNextSequence('pool_index')
          contrast.pool_child_address = await wallet.getPoolChildAddress(contrast.pool_index)
          await ContrastModel.insertOne(contrast)
          param.pool_tx_hash = await wallet.vote('vote',contrast.pool_index,contrast.amount,false)
        }
      } else if (param.type == 2) {
        if (ret) {
          let tempamount = new Decimal(param.amount) 
          if ((new Decimal(ret.amount).dividedBy(tempamount).toNumber()) < 0) {
            ctx.res.fail({
              code: -1,
              message: 'amount is insufficient'
            })
            return
          } 

          param.pool_tx_hash = await wallet.vote('unvote',ret.pool_index,param.amount,false)

          await ContrastModel.updateOne({
            address:param.address
          },{
            $set: {
              amount: new Decimal(ret.amount).dividedBy(tempamount).toNumber()
            }
          })
          await RedeemModel.insertOne({
            receive_address:param.address,
            redeem_pool_index:ret.pool_index,
            amount:param.amount,
            pool_tx_hash:param.pool_tx_hash,
            create_time: new Date().getTime(),
            // end_time:
          })
        } else {
          ctx.res.fail({
            code: -1,
            message: 'address is not found'
          })
          return
        }
      }
    } catch (error) {
      ctx.res.fail({
        code: -1,
        message: error.message
      })
      return
    }
    param.create_time = new Date().getTime()
    await RecordModel.insertOne(param)
    ctx.res.ok({
      body:{
        code:0,
        message:'success'
      }
    })
  }

  async recordFind(ctx) {
    const pagination = queryToPagination(ctx.query)
    let query = {address:ctx.query.address}
    const data = await RecordModel
      .find(query)
      .sort({_id:-1})
      .limit(pagination.limit)
      .skip(pagination.offset)
    
    // const total = await RecordModel.estimatedDocumentCount()
    const total = await RecordModel.countDocuments(query)
    ctx.res.ok({
      body:{
        data,
        page: pagination.page,
        size: pagination.size,
        total,
      }
    })
  }

  async poolInfo(ctx){
    const indata = await RecordModel.find({type:1})
    const outdata = await RecordModel.find({type:2})
    let inamount = new Decimal(0) 
    let outamount = new Decimal(0) 
    await indata.forEach(element => {
      inamount = inamount.plus(element.amount) 
    });
    await outdata.forEach(element => {
      outamount = outamount.plus(element.amount)
    });
    const data = {
      poolamount:inamount.minus(outamount).toNumber(),
      cetamount:Math.random()*1e8,
      dacamount:Math.random()*1e8,
    }
    ctx.res.ok({
      body:{
        poolinfo:data
      }
    })
  }
  async reward(ctx){
    let param = ctx.request.body
    let contrast = await ContrastModel.find({address:param.address})
    if (contrast) {
      let tx_hash = await wallet.reward(contrast.pool_index)
      let amount = await wallet.getBalance(contrast.pool_index)
      if (amount) {
        let sendtx_hash = await wallet.send(contrast.pool_index,contrast.address,amount)
        ctx.res.ok({
          body:{
            code:0,
            tx_hash:sendtx_hash
          }
        })
      } else {
        ctx.res.fail({
          code: -1,
          message: 'amount is insufficient'
        })
      }
    } else {
      ctx.res.fail({
        code: -1,
        message: 'address is not reward'
      })
    }
  }
}

async function getNextSequence(sequenceName) {
  let total = await CountersModel.estimatedDocumentCount()
  if (total == 0) {
    await CountersModel.insertOne({_id:'pool_index',seq:1})
  }
  let ret = await CountersModel.findOneAndUpdate(
    {_id:sequenceName},
    {$inc:{seq:1}}).exec(function(err,data){
      return data.seq
  })
  return ret.value.seq
}
module.exports = PoolController