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
  },
  google:{
    clientId:'852595544771-kerel776etav8jqgrc63dfl4k0q4pli7.apps.googleusercontent.com',
    clientSecret:'STkNmVtDAigpN27NgfyziXw9',
  },
  github:{
    clientId:'2edd9b6edbe2c9d83749',
    clientSecret:'de73980d6ab56028cbea953985b875850b7688fb',
  }
}
