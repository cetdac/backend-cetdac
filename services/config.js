let bitcoin = require('bitcoinjs-lib')
let host = process.env.NODE_ENV === 'api-dev' ? 'http://chrome.56gonglue.cn' : 'http://chrome.56gonglue.cn'
module.exports = {
  host:host,
  fb:{
    clientId:'2059520324314582',
    clientSecret:'f4482f919ef4b33519d1ac0fc2fd1642'
  },
  google:{
    clientId:'852595544771-kerel776etav8jqgrc63dfl4k0q4pli7.apps.googleusercontent.com',
    clientSecret:'STkNmVtDAigpN27NgfyziXw9',
  },
  github:{
    clientId:'2edd9b6edbe2c9d83749',
    clientSecret:'de73980d6ab56028cbea953985b875850b7688fb',
  },
  wechat: {
    appid: 'wx75abf91974646d4e',
    secret: '7bb6556b6a498d6444585702e556df7f',
    mchid: '1510499781',
    partnerKey: '7MMszJXsCPna6LNcGNT9e4YyJqsdFpqX',
    cheapPrice: 50 * 100,
    expensivePrice: 100 * 100,
    withdrawPrice: 1 * 100
  }
}
