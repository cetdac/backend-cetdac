const passport = require('koa-passport')
const config = require('../config')
const account = require('../controller/account')

const createUser = ((provider, profile) => {
  // This is an example! Use password hashing in your
  let user = {
    provider: provider,
    mobile: profile.mobile,
    id_in_app: profile.id,
    mobile: profile.mobile,
    short_name : profile.displayName,
    emails : profile.emails ? profile.emails.map(item=>{ return item.value}).join() : undefined,
    from: 'chrome'
  }
  if(/google/i.test(provider)){
    user.avatar = profile.image?profile.image.url:undefined
    user.first_name = profile.name?profile.name.givenName:undefined
    user.last_name = profile.name?profile.name.familyName:undefined
  } else if(/facebook/i.test(provider)){
    user.avatar = profile.photos[0] ? profile.photos[0].value : undefined
    user.first_name = profile.name?profile.name.givenName:undefined
    user.last_name = profile.name?profile.name.familyName:undefined
  }else if(/github/i.test(provider)){
    user.avatar = profile.photos[0] ? profile.photos[0].value : undefined
    user.location = profile.location
    user.short_name = profile.displayName
  }else if (/wechat/i.test(provider)) {
    
  }
  
  return account.createByProfile(user)
})

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
  try {
    const user = {id: id}
    done(null, user)
  } catch(err) {
    done(err)
  }
})

// const LocalStrategy = require('passport-local').Strategy
// passport.use(new LocalStrategy(function(username, password, done) {
//   createUser('manual', profile).then(user => done(null, user)).catch(err => done(err))
// }))

const FacebookStrategy = require('passport-facebook').Strategy
passport.use(new FacebookStrategy({
    clientID: config.fb.clientId,
    clientSecret: config.fb.clientSecret,
    callbackURL: config.host + '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'name', 'gender', 'location', 'photos']
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    console.log('facebook', profile)
    createUser('facebook',profile).then(user => done(null, user))
  }
))

var GitHubStrategy = require('passport-github').Strategy;
 
passport.use(new GitHubStrategy({
    clientID: config.github.clientId,
    clientSecret: config.github.clientSecret,
    callbackURL: config.host + '/api/auth/github/callback'
  },
  function(token, tokenSecret, profile, done) {
    console.log('github', profile)
    // retrieve user ...
    createUser('github', profile).then(user => done(null, user))
  }
));

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
    clientId: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.host + '/api/auth/google/callback'
  },
  function(token, tokenSecret, profile, done) {
    console.log('google', profile)
    // retrieve user ...
    createUser('google', profile).then(user => done(null, user))
  }
))

const WeixinStrategy = require('passport-weixin').Strategy
passport.use('loginByWeixin', new WeixinStrategy({
  clientID: config.wechat.appid,
  clientSecret: config.wechat.secret,
  callbackURL: config.host + '/api/auth/weixin/callback',
  requireState: false,
  scope: 'snsapi_base'
}, function(accessToken, refreshToken, profile, done){
  console.log('wechat', profile)
  createUser('wechat', profile).then(user => done(null, user))
}));


// const TwitterStrategy = require('passport-twitter').Strategy
// passport.use(new TwitterStrategy({
//     consumerKey: 'Nv2YHJfZI3pKkXAv8967RW0Tt',
//     consumerSecret: 'inQ8xmiv5Z5tnFEd1QoOhGrkUe2jvtL4LFEKcsaKe5n0jXcIxB',
//     callbackURL: 'http://'+host+':' + (process.env.PORT || 3000) + '/auth/twitter/callback'
//   },
//   function(token, tokenSecret, profile, done) {
//     // retrieve user ...
//     fetchUser().then(user => done(null, user))
//   }
// ))


// const WeiboStrategy = require('passport-weibo').Strategy
// passport.use(new WeiboStrategy({
//     clientID: "1309175851",
//     clientSecret: "07b23e32f980c61aedce2043ab708997",
//     callbackURL: 'http://'+host+':' + (process.env.PORT || 3000) + '/auth/weibo/callback',
//   },
//   function(accessToken, refreshToken, profile, done) {
//     fetchUser().then(user => done(null, user))
// }))

// const qqStrategy = require('passport-qq').Strategy
// passport.use(new qqStrategy({
//     clientID: "1106126779",
//     clientSecret: "Ousf6puMK44fvSWX",
//     callbackURL: 'http://'+host+':' + (process.env.PORT || 3000) + '/auth/qq/callback',
//   },
//   function(accessToken, refreshToken, profile, done) {
//     fetchUser().then(user => done(null, user))
//   }
// ));