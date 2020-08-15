require('dotenv').config();
const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const db = require('../models')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

//passport serrialize's info to make it easier to login
passport.serializeUser((user, cb) => {
    cb(null, user)
})

// deserializeUser takes the id and looks it up in db
passport.deserializeUser((obj, cb) => {
    cb(null, obj)
})

passport.use(new BnetStrategy({
        clientID: BNET_ID,
        clientSecret: BNET_SECRET,
        scope: ['wow.profile'],
        passReqToCallback: true,
        callbackURL: "https://thedevtron.com/auth/bnet/callback"
    },
    (req, accessToken, refreshToken, profile, done) => {
        console.log("User Profile:", profile)
        console.log(`Connecting battle.net user '${profile.battletag}' ('${profile.id}')`)
        return done(null, profile)
    })
)

module.exports = passport