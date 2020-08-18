require('dotenv').config()
fs = require('fs')
const server = require('./server')
const db = require('./models')
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

let insertData = (itemListing) => {
    setTimeout(() => {
        db.item.findOrCreate({
            where: {
                id: itemListing.item.id
            }
        })
            .then((wowItem, created) => {
                if (created) {
                    console.log("New item added:", wowItem.id)
                }
                // console.log("Item Data:", itemListing)
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
    }, 1000)
}

const testAuctionMethod = () => {
    console.log("Running auction house grabbing")
    getToken(access_token => {
        db.connectedRealm.findAll()
            .then(connRealm => {
                // console.log(connRealm)
                connRealm.forEach(aConRealm => {
                    let auctionHouse = aConRealm.auctionHouse
                    axios.get(`${auctionHouse}&access_token=${access_token}`)
                        .then(async results => {
                            await fs.writeFile('auctionData.js', JSON.stringify(results.data.auctions), function (err,data) {
                                if (err) {
                                    console.log(err)
                                }
                            })
                            status = results.status
                            statusMessage = results.statusText
                            if(status === 200) {
                                //Create a readable stream
                                var readerStream = fs.createReadStream('auctionData.js');

                                // Handle stream events --> data, end, and error
                                readerStream.on('data', function(chunk) {
                                    chunk = JSON.parse(chunk)
                                    console.log("CHUNKY HEAP:", chunk)
                                });

                                readerStream.on('end',function() {
                                    console.log("Done")
                                });

                                readerStream.on('error', function(err) {
                                    console.log(err.stack);
                                });
                            } else {
                                console.log("Auction House Fetch Failed:", statusMessage)
                            }
                            // setInterval(testAuctionMethod, 1 * 60 * 60 * 1000)
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