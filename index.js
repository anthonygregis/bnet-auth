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
    console.log("Running auction house grabbing")
    getToken(access_token => {
        db.connectedRealm.findAll()
            .then(connRealm => {
                console.log(connRealm)
                connRealm.forEach(aConRealm => {
                    let auctionHouse = aConRealm.auctionHouse
                    axios.get(`${auctionHouse}&access_token=${access_token}`)
                        .then(results => {
                            let i = 0
                            status = results.status
                            statusMessage = results.statusText
                            auctionData = results.data.auctions
                            do {
                                auctionSubData = auctionData.slice(i, 100)
                                i += 100
                                if(status === 200) {
                                    auctionSubData.forEach(itemListing => {
                                        db.item.findOrCreate({
                                            where: {
                                                id: itemListing.item.id
                                            }
                                        })
                                            .then((wowItem, created) => {
                                                if (created) {
                                                    console.log("New item added:", wowItem.id)
                                                }
                                                console.log("Item Data:", itemListing)
                                                db.pricingData.create({
                                                    unitPrice: itemListing.unit_price || itemListing.buyout,
                                                    quantity: itemListing.quantity,
                                                    itemId: itemListing.item.id
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
                            }
                            while(i <= auctionData.length)
                            setInterval(testAuctionMethod, 1 * 60 * 60 * 1000)
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
testAuctionMethod()