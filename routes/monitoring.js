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

    let autoData = {}

    realms.forEach(realm => {
        autoData[`${realm.slug}`] = null
    })

    db.monitoredItem.findOne({
        where: {
            id: req.params.id
        },
        include: [db.realm]
    })
        .then(monitoredItem => {
            res.render('monitoring/edit', {monitoredItem: monitoredItem, autoData: autoData, pageName: "Monitored Item Edit", pageDescription: 'Edit your monitored item' })
        })
        .catch(err => {
            console.log(err)
        })
})

router.put('/edit/:id', isLoggedIn, async (req, res) => {
    db.realm.findOne({
        where: {
            slug: req.body.realm
        }
    })
        .then(realm => {
            if(realm !== null) {
                db.monitoredItem.update({
                        realmId: realm.id
                    },
                    {
                        where: {
                            id: req.body.id
                        }
                    })
                    .then(result => {
                        req.flash('success', "Monitored item has been updated")
                        res.redirect('/monitoring')
                    })
                    .catch(err => {
                        req.flash('error', "Monitored item could not be updated")
                        res.redirect('/monitoring')
                    })
            } else {
                req.flash('error', "Realm name must use autocomplete version")
                res.redirect(`/monitoring/edit/${req.body.id}`)
            }
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