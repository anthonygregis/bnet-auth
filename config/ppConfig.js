require('dotenv').config();
const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const db = require('../models')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

//passport serrialize's info to make it easier to login
passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

// deserializeUser takes the id and looks it up in db
passport.deserializeUser((id, cb) => {

    db.user.findByPk(id)
    .then(user => {
        cb(null, user)
    }).catch(cb)
})

passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://localhost:3000/auth/bnet/callback",
    scope: ['wow.profile', 'openid']
}, (accessToken, refreshToken, profile, cb) => {
    console.log(`Connecting battle.net user '${profile.battletag}' ('${profile.id}')`)
    cb(null, profile)
    // db.user.findOne({
    //     where: { email }
    // })
    // .then(user => {
    //     if(!user || !user.validPassword(password)) {
    //         cb(null, false)
    //     } else {
    //         cb(null, user)
    //     }
    // })
    // .catch(err => {
    //     cb(err, null)
    // })
}))

module.exports = passport