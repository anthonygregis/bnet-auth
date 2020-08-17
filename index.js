const server = require('./server')

const testAuctionMethod = () => {
    console.log("Running")
}

//Start Express
server

//Run console.log every 5 mintes
setInterval(testAuctionMethod, 5000)