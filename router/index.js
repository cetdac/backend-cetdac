const passport = require('koa-passport')
const google = require('../services/controller/google')

module.exports = function(routers) {

  //google
  routers.get('/auth/google', passport.authenticate('google'))
  routers.get('/auth/google/callback',passport.authenticate('google',
   { failureRedirect: '/login' }),
   function(req, res) {
     // Successful authentication, redirect home.
     res.redirect('/');
   })

   routers.get('/auth/google/webhook', google.webhook_verify)

  //facebook
  routers.get('/auth/facebook', passport.authenticate('facebook'))
  routers.get('/auth/facebook/callback', passport.authenticate('facebook', 
  { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  })
}