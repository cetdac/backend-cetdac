let bitcoin = require('bitcoinjs-lib')
let host = process.env.NODE_ENV === 'api-dev' ? 'https://chrome.approles.com' : 'https://chrome.approles.com'
module.exports = {
  host:host,
  fb:{
    clientId:'2059520324314582',
    clientSecret:'f4482f919ef4b33519d1ac0fc2fd1642',
    redirect:{
      success:'',
      fail:''
    }
  }
}
