const express = require('express')
const router = express.Router()
const passport = require('../config/ppConfig')
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/bnet', passport.authenticate('bnet'))

router.get('/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/auth/failure' }), (req, res) => {
    req.flash('success', 'Aaaaaughibbrgubugbugrguburgle!')
    res.redirect("/")
})

router.get('/logout', isLoggedIn, (req, res)=>{
  req.logOut()
  req.flash('Thank you, come again...')
  res.redirect('/')
})

module.exports = router
