require('dotenv').config();
const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const db = require('../models')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

//passport serrialize's info to make it easier to login
passport.serializeUser((user, done) => {
    done(null, user.bnetId)
})

// deserializeUser takes the id and looks it up in db
passport.deserializeUser((bnetId, done) => {
    db.user.findOne({
        where: {
            bnetId: bnetId
        }
    })
        .then(user => {
            done(null, user)
        })
        .catch(err => {
            done(err, null)
        })
})

passport.use(new BnetStrategy({
        clientID: BNET_ID,
        clientSecret: BNET_SECRET,
        scope: ['wow.profile'],
        passReqToCallback: true,
        callbackURL: "https://battle-net-auth.herokuapp.com/auth/bnet/callback"
    },
    (req, accessToken, refreshToken, profile, done) => {
        console.log("User Profile:", profile)
        console.log(`Connecting battle.net user '${profile.battletag}' ('${profile.id}')`)
        db.user.findOrCreate({
            where: {
                bnetId: profile.id,
                battletag: profile.battletag
            }
        })
            .then(([user, created]) => {
                if (created) {
                    console.log("New user created:", user.get().battletag)
                    return done(null, user)
                } else {
                    console.log("Returning user:", user.get().battletag)
                    return done(null, user)
                }
            })
            .catch(err => {
                return done(err, null)
            })
    })
)

module.exports = passport