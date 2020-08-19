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

let insertDataPricing = (itemListing, aConRealm) => {

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
                            const asyncIterable = {
                                [Symbol.asyncIterator]() {
                                    return {
                                        i: 0,
                                        next() {
                                            if (this.i < 25000) {
                                                return Promise.resolve({ value: this.i++, done: false });
                                            }

                                            return Promise.resolve({ done: true });
                                        }
                                    };
                                }
                            };

                            (async function() {
                                for await (let num of asyncIterable) {
                                    try {

                                        const result = await db.sequelize.transaction(async (t) => {

                                            const item = await db.item.findOrCreate({
                                                where: {
                                                    id: results.data.auctions[num].item.id
                                                },
                                                transaction: t
                                            })

                                            const pricingData = await db.pricingData.create({
                                                unitPrice: results.data.auctions[num].unit_price || results.data.auctions[num].buyout,
                                                quantity: results.data.auctions[num].quantity,
                                                itemId: results.data.auctions[num].item.id,
                                            }, { transaction: t })

                                            pricingData.setConnectedRealm(connRealm[currentRealm].get().id)

                                            return true

                                        });

                                        // If the execution reaches this line, the transaction has been committed successfully
                                        // `result` is whatever was returned from the transaction callback (the `user`, in this case)

                                    } catch (error) {
                                        console.log("ERROR:", error)
                                        // If the execution reaches this line, an error occurred.
                                        // The transaction has already been rolled back automatically by Sequelize!

                                    }
                                }
                            })()
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