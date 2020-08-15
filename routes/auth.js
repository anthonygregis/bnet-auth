const express = require('express');
const router = express.Router();
const passport = require('../config/ppConfig')

router.get('/bnet', passport.authenticate('bnet'))

router.get('/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/weewoo', successRedirect: '/' }))

router.get('/logout', (req, res)=>{
  req.logOut()
  req.flash('Thank you, come again... Apu')
  res.redirect('/')
})

module.exports = router;
