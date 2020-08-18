require('dotenv').config()
const fs = require('fs')
const path = require('path')
const server = require('./server')
const db = require('./models')
const axios = require('axios')
var exec = require('exec')
const withParser = require('stream-json/utils/withParser');
const { pick } = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');
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
}

const testAuctionMethod = () => {
    console.log("Running auction house grabbing")
    getToken(access_token => {
        db.connectedRealm.findAll()
            .then(connRealm => {
                // console.log(connRealm)
                connRealm.forEach(async aConRealm => {
                    let auctionHouse = aConRealm.auctionHouse
                    const writeStream = fs.createWriteStream(path.resolve(__dirname, 'auctionData.txt'))
                    const stream = await axios
                        .get(`${auctionHouse}&access_token=${access_token}`, { responseType: 'stream' })
                        .then(results => results.data)
                        .catch(err => {
                            console.log("ERROR:", err)
                        })

                    const pipeline = stream
                        .pipe(streamArray.withParser(Pick, { filter: "auctions" })())

                    pipeline.on("data", ({ value }) => console.log(value))
                    pipeline.on("end", () => console.log("end"))
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
//     console.log("Shit broke");
// });