require('dotenv').config()
const server = require('./server')
const db = require('./models')
const request = require('request')
const axios = require('axios')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

var dataString = 'grant_type=client_credentials';

var options = {
    url: 'https://us.battle.net/oauth/token',
    method: 'POST',
    body: dataString,
    auth: {
        'user': BNET_ID,
        'pass': BNET_SECRET
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    } else {
        console.log(response.statusCode, body);
    }
}




const testAuctionMethod = () => {
    request(options, callback)
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