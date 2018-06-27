const passport = require('koa-passport')
const config = require('../config')

const fetchUser = (() => {
  // This is an example! Use password hashing in your
  const user = { id: 1, username: 'test', password: 'test' }
  return async function() {
    return user
  }
})()

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
  try {
    const user = await fetchUser()
    done(null, user)
  } catch(err) {
    done(err)
  }
})

// const LocalStrategy = require('passport-local').Strategy
// passport.use(new LocalStrategy(function(username, password, done) {
//   fetchUser()
//     .then(user => {
//       if (username === user.username && password === user.password) {
//         done(null, user)
//       } else {
//         done(null, false)
//       }
//     })
//     .catch(err => done(err))
// }))

const FacebookStrategy = require('passport-facebook').Strategy
passport.use(new FacebookStrategy({
    clientID: config.fb.clientId,
    clientSecret: config.fb.clientSecret,
    callbackURL: config.host + '/api/auth/facebook/callback',
    profileFields: ['id', 'short_name', 'email', 'first_name', 'last_name', 'gender', 'location']
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    fetchUser().then(user => done(null, user))
  }
))

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

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
    clientId: '852595544771-kerel776etav8jqgrc63dfl4k0q4pli7.apps.googleusercontent.com',
    clientSecret: 'STkNmVtDAigpN27NgfyziXw9',
    callbackURL: config.host + '/api/auth/google/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    fetchUser().then(user => done(null, user))
  }
))

// const WeixinStrategy = require('passport-weixin-plus')
// passport.use(new WeixinStrategy({
//   clientID: 'your client id',
//   clientSecret: 'your key',
//   callbackURL: 'http://'+host+':' + (process.env.PORT || 3000) + '/auth/weixin/callback',
//   requireState: false,
//   scope: 'snsapi_login'
// }, function(accessToken, refreshToken, profile, done){
//   fetchUser().then(user => done(null, user))
// }));

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