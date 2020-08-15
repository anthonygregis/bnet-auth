const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')

app.get('/bnet', passport.authenticate('bnet'))

app.get('/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/weewoo', successRedirect: '/' }))

router.get('/logout', (req, res)=>{
  req.logOut()
  req.flash('Thank you, come again... Apu')
  res.redirect('/')
})

module.exports = router;
