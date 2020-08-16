require('dotenv').config();
const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const db = require('../models')
const axios = require('axios').default
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

//passport serrialize's info to make it easier to login
passport.serializeUser((user, done) => {
    console.log("Serializer : ", user.bnetId)
    done(null, user.bnetId)
})

// deserializeUser takes the id and looks it up in db
passport.deserializeUser((bnetId, done) => {
    console.log("Deserializer : ", bnetId)
    db.user.findOne({
        where: {
            id: bnetId
        }
    })
        .then(user => {
            done(null, user)
        })
        .catch(done)
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
                id: profile.id,
                battletag: profile.battletag
            }
        })
            .then(([user, created]) => {
                if (created) {
                    user.accessToken = accessToken
                    console.log("New user created:", user.get().battletag)

                    // Retrieve Characters
                    axios.get(`https://us.api.blizzard.com/profile/user/wow?namespace=profile-us&locale=en_US&access_token=${accessToken}`)
                        .then(profileData => {
                            let wowAccounts = profileData.data.wow_accounts
                            wowAccounts.forEach(account => {
                                account.characters.forEach(character => {
                                    user.createCharacter({
                                        id: character.id,
                                        name: character.name,
                                        class: character.playable_class.name,
                                        race: character.playable_race.name,
                                        gender: character.gender.name,
                                        faction: character.faction.name,
                                        level: character.level
                                    })
                                        .then(newChar => {
                                            user.addCharacter(newChar)
                                            axios.get(`https://us.api.blizzard.com/data/wow/realm/${character.realm.slug}?namespace=dynamic-us&locale=en_US&access_token=${accessToken}`)
                                                .then(realmResults => {
                                                    db.realm.findOrCreate({
                                                        where: {
                                                            id: realmResults.data.id,
                                                            name: realmResults.data.name,
                                                            type: realmResults.data.type.name,
                                                            isTournament: realmResults.data.is_tournament,
                                                            slug: realmResults.data.slug
                                                        }
                                                    })
                                                        .then(([realm, created]) => {
                                                            if (created) {
                                                                console.log("New Realm Created:", realm.name)
                                                            }
                                                            newChar.setRealm(realm)
                                                        })
                                                        .catch(err => {
                                                            console.log("ERROR:", err)
                                                        })
                                                })
                                                .catch(err => {
                                                    console.log("ERROR:", err)
                                                })
                                        })
                                        .catch(err => {
                                            console.log("ERROR:", err)
                                        })
                                })
                            })
                        })
                        .catch(err => {
                            console.log(err)
                        })

                    return done(null, user)
                } else {
                    console.log("Returning user:", user.get().battletag)
                    return done(null, user)
                }
            })
            .catch(err => {
                console.log("ERRRORRRR:", err)
                done(err, null)
            })
    })
)

module.exports = passport