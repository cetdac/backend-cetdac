let host = process.env.NODE_ENV === 'api-dev' ? 'https://chrome.bitapp.net' : 'https://chrome.bitapp.net',
    rpc = 'http://bchtest:Z0i3fdJnlq71ShNz@localhost:8332'

module.exports = {
  rpc:{
    url: rpc
  },
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
  }
}
