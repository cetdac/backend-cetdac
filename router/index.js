const passport = require('koa-passport')
const google = require('../services/controller/google')
const account = require('../services/controller/account')

module.exports = function(routers) {

  routers.post('/account', account.create)
  //google
  routers.get('/auth/google', passport.authenticate('google'))
  routers.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/fail'
  }))
  routers.get('/auth/google/webhook', google.webhook_verify)

  //github
  routers.get('/auth/github', passport.authenticate('github'))
  routers.get('/auth/github/callback', passport.authenticate('github', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/fail'
  }))

  //facebook
  routers.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['public_profile', 'user_gender', 'email', 'mobile']
  }))
  routers.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/fail'
  }))
}