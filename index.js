const server = require('./server')
const db = require('./models')

const testAuctionMethod = () => {
    db.connectedRealm.findAll()
        .then(connRealm => {
            connRealm.forEach(aConRealm => {
                console.log(aConRealm.dataValue.auctionHouse)
            })
        })
}

//Start Express
server

//Run console.log every 5 mintes
setInterval(testAuctionMethod, 5000)