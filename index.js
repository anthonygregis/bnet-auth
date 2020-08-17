require('dotenv').config()
const server = require('./server')
const db = require('./models')
const request = require('request')
const axios = require('axios')
var exec = require('exec')
const BNET_ID = process.env.BNET_ID
const BNET_SECRET = process.env.BNET_SECRET

const getToken = (cb) => {
    exec(`curl -u ${BNET_ID}:${BNET_SECRET} -d grant_type=client_credentials https://us.battle.net/oauth/token`
        , (error, result, metadata) => {
            results = JSON.parse(result)
            cb(results.access_token)
        });
}

const testAuctionMethod = () => {
    getToken(access_token => {
        db.connectedRealm.findAll()
            .then(connRealm => {
                console.log(connRealm)
                connRealm.forEach(aConRealm => {
                    let auctionHouse = aConRealm.auctionHouse
                    axios.get(`${auctionHouse}&access_token=${access_token}`)
                        .then(results => {
                            status = results.status
                            statusMessage = results.statusText
                            auctionData = JSON.parse(results.body)
                            if(status === 200) {
                                auctionData.forEach(itemListing => {
                                    db.item.findOrCreate({
                                        where: {
                                            id: itemListing.id
                                        }
                                    })
                                        .then((wowItem, created) => {
                                            if (created) {
                                                console.log("New item added:", wowItem.id)
                                            }
                                            wowItem.createPricingData({
                                                buyout: itemListing.buyout,
                                                quantity: itemListing.quantity
                                            })
                                                .then(pricingData => {
                                                    pricingData.setConnectedRealm(aConRealm)
                                                })
                                                .catch(err => {
                                                    console.log("ERROR:", err)
                                                })
                                        })
                                        .catch(err => {
                                            console.log("ERROR:", err)
                                        })
                                })
                            } else {
                                console.log("Auction House Fetch Failed:", statusMessage)
                            }
                        })
                        .catch(err => {
                            console.log("ERROR:", err)
                        })
                })
            })
            .catch(err => {
                console.log(err)
            })
    })
}

//Start Express
server

//Run console.log every 5 minutes
setInterval(testAuctionMethod, 60000)