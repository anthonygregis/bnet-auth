const express = require('express')
const router = express.Router()
const db = require('../models')
const { Op } = require('sequelize')
const passport = require('../config/ppConfig')
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/', isLoggedIn, async (req, res) => {
    const monitoredItems = await db.sequelize.query('SELECT ' +
                                                        'm.*,' +
                                                        'c.*,' +
                                                        'AVG(p.unitPrice), AVG(p.quantity) ' +
                                                    `FROM monitoredItems AS m WHERE m.id = ${req.user.id}` +
                                                    'INNER JOIN connectedRealms AS c ' +
                                                        'ON m.connectedRealmId = c.id ' +
                                                    'INNER JOIN pricingData as p ' +
                                                        'ON c.id = p.connectedRealmId AND p.itemId = m.itemId')
    // db.monitoredItem.findAll({
    //     where: {
    //         userId: req.user.id
    //     },
    //     include: [db.realm, {
    //         model: db.connectedRealm,
    //         include: {
    //             model: db.pricingData,
    //             attributes: [
    //                 'itemId',
    //                 [db.sequelize.fn('AVG', db.sequelize.col('buyoutPrice'), 'averageBuyout')],
    //                 [db.sequelize.fn('AVG', db.sequelize.col('quantity'), 'averageQty')]
    //             ],
    //             group: 'itemId',
    //             where: {
    //                 createdAt: {
    //                     [Op.lt]: new Date(),
    //                     [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
    //                 },
    //                 itemId: db.sequelize.col('monitoredItem.itemId')
    //             }
    //         }
    //     }]
    // })
    res.send(monitoredItems)
    // res.render('monitoring', {monitoredItems: monitoredItems, pageName: "Monitored Items", pageDescription: 'Your monitored items for a realm.' })
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