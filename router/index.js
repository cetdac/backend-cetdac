const passport = require('koa-passport')
const google = require('../services/controller/google')
const account = require('../services/controller/account')

module.exports = function(routers) {

  // account
  routers.get('/account/:id', account.get)
  routers.post('/account', account.create)
  routers.put('/account/:id', account.update)

  //google
  routers.get('/auth/google', passport.authenticate('google'))
  routers.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/fail' }),
    function(ctx, next) {
    ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  });
  routers.get('/auth/google/webhook', google.webhook_verify)

  //github
  routers.get('/auth/github', passport.authenticate('github'))
  routers.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/fail' }),
    function(ctx, next) {
    ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  });

  //facebook
  routers.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['public_profile', 'user_gender', 'email']
  }))
  routers.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/fail' }),
    function(ctx, next) {
    ctx.redirect('/auth/confirm?id='+ctx.state.user.id)
  });

  //weixin
  routers.get('/auth/wechat', passport.authenticate('loginByWeixin'))
  routers.get('/auth/wechat/callback', passport.authenticate('loginByWeixin', { failureRedirect: '/auth/fail' }),
  async function(ctx, next) {
    try{
      await ctx.login(ctx.state.user)
      next()
      ctx.redirect('/')
    } catch(e){
      console.error(e)
    }
  });


}