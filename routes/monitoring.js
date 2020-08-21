const express = require('express')
const router = express.Router()
const db = require('../models')
const passport = require('../config/ppConfig')
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/', isLoggedIn, (req, res) => {
    db.monitoredItem.findAll({
        where: {
            userId: req.user.id
        },
        include: [db.realm]
    })
        .then(monitoredItems => {
            res.render('monitoring', {monitoredItems: monitoredItems, pageName: "Monitored Items", pageDescription: 'Your monitored items for a realm.' })
        })
        .catch(err => {
            console.log(err)
        })
})

router.delete('/:id', isLoggedIn, (req, res) => {
    db.monitoredItem.destroyById(req.params.id)
        .then(monitoredItem => {
            req.flash('success', 'Monitored item has been deleted')
            res.redirect('/monitoring')
        })
})

module.exports = router