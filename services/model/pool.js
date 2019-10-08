const Types = require('mongolass').Types
const mongolass = require('../module/mongo')

const required = true

const RecordModel = mongolass.model('record', {
  address: { type: 'string', required },
  type:{type:Types.Number,required}, // 1 参与 2 赎回
  create_time: { type: Types.Number, required },
  amount: { type: Types.Number, required },
  tx_hash:{type: 'string',default:null},
  pool_tx_hash:{type: 'string', required}
})

const ContrastModel = mongolass.model('contrast', {
  address: { type: 'string', required },
  amount: { type: Types.Number, required },
  pool_child_address:{ type: 'string', required },
  pool_index:{ type: Types.Mixed, required }
})

const ProfitModel = mongolass.model('profit', {
  address:{ type: 'string', required },
  amount:{ type: Types.Number, required },
  time:{ type: Types.Number, required }
})

const RedeemModel = mongolass.model('redeem', {
  receive_address: { type: 'string' },
  redeem_pool_index: { type: Types.Number, required },
  pool_tx_hash:{ type: 'string' },
  amount:{ type: Types.Number, required },
  create_time:{ type: Types.Number, required },
  end_time:{ type:Types.Number},
  speed_hash:{ type: 'string' },
  receive_hash:{ type: 'string' },
  isSpeed:{ type:Types.Boolean, default:false},
  isClose:{ type:Types.Boolean, default:false}
})

const CountersModel = mongolass.model('counters',{
  _id:{ type: 'string', required },
  seq:{ type: Types.Number, required }
})


module.exports = {
  RecordModel,
  ContrastModel,
  RedeemModel,
  ProfitModel,
  CountersModel
}