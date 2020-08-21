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

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const realms = await db.realm.findAll({attributes: ['slug']})

    db.monitoredItem.findOne({
        where: {
            id: req.params.id
        },
        include: [db.realm]
    })
        .then(monitoredItem => {
            res.send(realms)
            // res.render('monitoring/edit', {monitoredItem: monitoredItem, realms: realms, pageName: "Monitored Item Edit", pageDescription: 'Edit your monitored item' })
        })
        .catch(err => {
            console.log(err)
        })
})

router.delete('/', isLoggedIn, (req, res) => {
    db.monitoredItem.destroy({
        where: {
            id: req.body.id
        }
    })
        .then(monitoredItem => {
            req.flash('success', 'Monitored item has been deleted')
            res.redirect('/monitoring')
        })
})

module.exports = router