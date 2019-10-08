const Wallet = require('../services/module/wallet') 
const wallet = new Wallet()
const { RedeemModel } = require('../services/model/pool')
const CronJob = require('cron').CronJob

const REDEEM_TIME = 1 * 60 * 60 * 1000

async function redeem(){
  const redeems = await RedeemModel.find({isClose:false})
  for (let index = 0; index < redeems.length; index++) {
    let redeem = redeems[index];
    let now = new Date().getTime()
    if (now > (redeem.create_time + REDEEM_TIME) && redeem.receive_address && redeem.redeem_pool_index && redeem.pool_tx_hash) {
      let tx_hash = await wallet.send(redeem.redeem_pool_index,redeem.receive_address,redeem.amount)
      await RedeemModel.updateOne({
        pool_tx_hash:redeem.pool_tx_hash
      },{
        $set: {
          receive_hash:tx_hash,
          isClose:true
        }
      })
    }
  }
}

function startRedeem() {
  const job = new CronJob('*/30 * * * *', redeem)
  job.start()
}

module.exports = startRedeem