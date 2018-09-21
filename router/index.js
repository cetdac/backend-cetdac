// const passport = require('koa-passport')
// const google = require('../services/controller/google')
// const account = require('../services/controller/account')
const faucet = require('../services/controller/faucet')
const ratelimit = require('koa-ratelimit')
const Redis = require('ioredis')

module.exports = function(routers) {

  let getLimit = ratelimit({
      db: new Redis(6379),
      duration: 1000 * 60 * 60 * 12,
      errorMessage: 'REQUEST_FREQUENCY_LIMIT',
      id: (ctx) => {
        return ctx.request.body.address + ctx.request.header["x-real-ip"]
      },
      headers: {
          remaining: 'Rate-Limit-Remaining',
          reset: 'Rate-Limit-Reset',
          total: 'Rate-Limit-Total'
      },
      max: 3,
      disableHeader: false,
  })

  // faucet
  routers.post('/faucet/getbch', getLimit, faucet.getBch)
  routers.get('/faucet/bchbalance', faucet.getBchBalance)
  routers.post('/faucet/geteth', getLimit, faucet.getEth)
  routers.get('/faucet/ethbalance', faucet.getEthBalance)


  // account
  // routers.get('/account/:id', account.get)
  // routers.post('/account', account.create)
  // routers.put('/account/:id', account.update)

  // //google
  // routers.get('/auth/google', passport.authenticate('google'))
  // routers.get('/auth/google/callback',
  // passport.authenticate('google', { failureRedirect: '/auth/fail' }),
  //   function(ctx, next) {
  //   ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  // });
  // routers.get('/auth/google/webhook', google.webhook_verify)

  // //github
  // routers.get('/auth/github', passport.authenticate('github'))
  // routers.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/fail' }),
  //   function(ctx, next) {
  //   ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  // });

  // //facebook
  // routers.get('/auth/facebook', passport.authenticate('facebook',{
  //   scope: ['public_profile', 'user_gender', 'email']
  // }))
  // routers.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/fail' }),
  //   function(ctx, next) {
  //   ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  // });
}