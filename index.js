require('dotenv').config()
const server = require('./server')
const db = require('./models')
const request = require('request')
const axios = require('axios')
var exec = require('exec')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

const getToken = () => {
    exec(`curl -u ${BNET_ID}:${BNET_SECRET} -d grant_type=client_credentials https://us.battle.net/oauth/token`
        , (error, result, metadata) => {
            console.log(result.access_token);
        });
}

const testAuctionMethod = () => {
    getToken()
    db.connectedRealm.findAll()
        .then(connRealm => {
            connRealm.forEach(aConRealm => {
                let auctionHouse = aConRealm.auctionHouse
            })
        })
        .catch(err => {
            console.log(err)
        })
}

//Start Express
server

//Run console.log every 5 mintes
setInterval(testAuctionMethod, 5000)