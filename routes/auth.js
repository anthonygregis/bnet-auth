const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')

router.get('/login', passport.authenticate('bnet'))

router.get('/login/callback', passport.authenticate('bnet', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    }
)

router.get('/logout', (req, res)=>{
  req.logOut()
  req.flash('Thank you, come again... Apu')
  res.redirect('/')
})

module.exports = router;
