require('dotenv').config()
const express = require('express')
const layouts = require('express-ejs-layouts')
const app = express()
const session = require('express-session')
const SECRET_SESSION = process.env.SECRET_SESSION
const passport = require('./config/ppConfig')
const flash = require('connect-flash')

const db = require('./models')
const { Op, QueryTypes } = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store)
const seqStore = new SequelizeStore({
  db: db.sequelize,
  expiration: 8 * 60 * 60 * 1000
})

// require authorization middleware
// const isLoggedIn = require('./middleware/isLoggedIn')

app.set('view engine', 'ejs')

app.use(require('morgan')('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))
app.use(layouts)

// secret: what we are actually giving the user to use for our site
// resave: save session even if modified, make this false
//saveUninitialized: if we have a new session, we will save it, make this true

app.use(session({
  secret: SECRET_SESSION,
  store: seqStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000
  },
  proxy: true
}))

// DEBUGGING | Remove later
db.sequelize.sync()

// ENSURE ALL TABLES PRESENT
seqStore.sync()

// init passport and run session on middleware
app.use(passport.initialize())
app.use(passport.session())

//flash for temp messages to the user
app.use(flash())

app.use((req, res, next) => {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next();
});

app.use('/auth', require('./routes/auth'))
app.use('/realms', require('./routes/realm'))
app.use('/monitoring', require('./routes/monitoring'))

app.get('/', function(req, res) {
  res.render('index', { pageName: "Home", pageDescription: "Welcome to WoW Marketplace Tracking" })
});

app.get('/items', async (req, res) => {
  //Get Items Info
  let mostAvailableItems = await db.sequelize.query(`SELECT DISTINCT(itemId), COUNT(quantity) 'totalQuantity' FROM pricingData GROUP BY itemId ORDER BY 'totalQuantity' LIMIT 40`, { type: QueryTypes.SELECT })
  res.render('items', { mostAvailableItems: mostAvailableItems, pageName: "Global Most Available Items", pageDescription: 'Global most popular items currently.' })
})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`)
});

module.exports = server;
