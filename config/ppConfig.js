const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const db = require('../models')
var BNET_ID = process.env.BNET_ID
var BNET_SECRET = process.env.BNET_SECRET

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
    clientId: BNET_ID,
    clientSecret: BNET_SECRET
}, (accessToken, refreshToken, profile, cb) => {
    console.log(accessToken, refreshToken, profile)
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