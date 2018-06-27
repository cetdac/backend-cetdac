const passport = require('koa-passport')
const google = require('../services/controller/google')

module.exports = function(routers) {

  //google
  routers.get('/auth/google', passport.authenticate('google'))
  routers.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/static/temp/index.html?result=success',
    failureRedirect: '/static/temp/index.html?result=fail'
  }))
  routers.get('/auth/google/webhook', google.webhook_verify)

  //github
  routers.get('/auth/github', passport.authenticate('github'))
  routers.get('/auth/github/callback', passport.authenticate('github', {
    successRedirect: '/static/temp/index.html?result=success',
    failureRedirect: '/static/temp/index.html?result=fail'
  }))

  //facebook
  routers.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['public_profile', 'user_gender', 'email']
  }))
  routers.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/static/temp/index.html?result=success',
    failureRedirect: '/static/temp/index.html?result=fail'
  }))
}