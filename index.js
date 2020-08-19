require('dotenv').config()
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

let insertData = async (itemListing, aConRealm) => {
        const item = await db.item.findOrCreate({
            where: {
                id: itemListing.item.id
            }
        })
            .then( (wowItem, created) => {
                // if (created) {
                //     console.log("New item added:", wowItem.id)
                // }
                // console.log("Item Data:", itemListing)
            })
            .catch(err => {
                console.log(err)
            })

        const pricingData = await db.pricingData.create({
            unitPrice: itemListing.unit_price || itemListing.buyout,
            quantity: itemListing.quantity,
            itemId: itemListing.item.id
        })
            .then((pricingData) => {
                pricingData.setConnectedRealm(aConRealm)
            })
            .catch(err => {
                console.log(err)
            })
}

const testAuctionMethod = () => {
    console.log("Running auction house grabbing")
    getToken(access_token => {
        db.connectedRealm.findAll()
            .then(connRealm => {
                // Realm iterator
                let currentRealm = 0

                let auctionHouse = connRealm[currentRealm].auctionHouse
                axios.get(`${auctionHouse}&access_token=${access_token}`)
                    .then((results) => {
                        // Get all auction info and put each object into csv
                        // Load csv file and query that into database
                        status = results.status
                        statusMessage = results.statusText
                        if(status === 200) {
                            for(let i = 0; i < 15000; i++) {
                                insertData(results.data.auctions[i], connRealm[currentRealm])
                            }
                            //Go to next connectedRealm after completing for loop
                            currentRealm += 1
                        } else {
                            console.log("Auction House Fetch Failed:", statusMessage)
                        }
                        // setInterval(testAuctionMethod, 1 * 60 * 60 * 1000)
                    })
                    .catch(err => {
                        console.log("ERROR:", err)
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

//STUPID STUFF
//Create a readable stream
// var readerStream =
//
//     // Handle stream events --> data, end, and error
//     readerStream.on('data', function(chunk) {
//         console.log("Chunk:", chunk)
//     });
//
// readerStream.on('end',function() {
//     console.log("Done")
// });
//
// readerStream.on('error', function(err) {
//     console.log("stuff broke");
// });