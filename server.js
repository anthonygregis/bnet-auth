require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session')
const SECRET_SESSION = process.env.SECRET_SESSION
const passport = require('./config/ppConfig')
const flash = require('connect-flash')


// require authorization middleware
// const isLoggedIn = require('./middleware/isLoggedIn')

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);


// secret: what we are actually giving the user to use for our site
// resave: save session even if modified, make this false
//saveUninitialized: if we have a new session, we will save it, make this true
app.use(session({
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000
  }
}))
// init passport and run session on middleware
app.use(passport.initialize())
app.use(passport.session())

//flash for temp messages to the user
app.use(flash())

// MOVED TO ROUTER AUTH
// app.get('/auth/bnet', passport.authenticate('bnet'))
//
// app.get('/auth/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/weewoo', successRedirect: '/' }))

app.get('/', function(req, res) {
  if(req.user) {
    console.log(req.user)
  }
  if(req.user) {
    var output = '<h1>Express OAuth Test</h1>' + req.user.id + '<br>';
    if(req.user.battletag) {
      output += req.user.battletag + '<br>';
    }
    output += '<a href="/logout">Logout</a>';
    res.send(output);
  } else {
    res.send('<h1>Express OAuth Test</h1>' +
        '<a href="/auth/bnet">Login with Bnet</a>');
  }
});

app.use('/auth', require('./routes/auth'));

// app.get('/', (req, res) => {
//   res.render('index', { alerts: req.flash() });
// });
//
// app.get('/profile', isLoggedIn, (req, res) => {
//   res.render('profile');
// });
//


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;
