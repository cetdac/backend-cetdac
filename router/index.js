const passport = require('koa-passport')

module.exports = function(routers) {
 //facebook
  routers.get('/auth/facebook', passport.authenticate('facebook'))
  routers.get('/auth/facebook/callback', passport.authenticate('facebook', 
  { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  })
}