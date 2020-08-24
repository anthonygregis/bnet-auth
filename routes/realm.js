const express = require('express')
const router = express.Router()
const db = require('../models')
const { Op, QueryTypes } = require("sequelize");
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/', (req, res) => {
    db.realm.findAll()
        .then(realms => {
            res.render('realms', { realms: realms, pageName: "Realms", pageDescription: "All available realms for marketplace tracking." })
        })
})

router.get('/:realmSlug', async (req, res) => {
    //Get Realm Info
    let realmInfo = await db.realm.findOne({
        where: { slug: req.params.realmSlug },
        include: {
            model: db.connectedRealm
        }
    })

    let items = await db.item.findAll()

    items = items.slice(0, 25)

    //Get Items Info
    let mostAvailableItems = await db.pricingData.findAll({
        where: {
            connectedRealmId: realmInfo.connectedRealm.id,
            createdAt: {
                [Op.gt]: new Date(new Date() - 2 * 60 * 60 * 1000)
            }
        },
        attributes: ['itemId', 'quantity'],
        order: [
            ['quantity', 'DESC']
        ],
        limit: 10
    })
    res.send(mostAvailableItems)
    // res.render('realm/index', { realmInfo: realmInfo, mostAvailableItems: mostAvailableItems, items: items, pageName: realmInfo.name, pageDescription: realmInfo.name + 's historical marketplace data and most popular items currently.' })
})

router.get('/:realmSlug/:itemId', async (req, res) => {
    let realmInfo = await db.realm.findOne({
        where: { slug: req.params.realmSlug },
        include: {
            model: db.connectedRealm
        }
    })

    //Get Items Info
    let itemHistoricalData = await db.pricingData.findAll({
        where: {
            itemId: req.params.itemId,
            connectedRealmId: realmInfo.connectedRealm.id
        },
        order: [
            ['createdAt', 'ASC']
        ]
    })

    let pricingDates = []
    let pricingData = []

    for(let i = 0; i < itemHistoricalData.length; i++) {
        pricingDates.push(`"${itemHistoricalData[i].createdAt.toLocaleString()}"`)
        pricingData.push(Math.round(itemHistoricalData[i].unitPrice / itemHistoricalData[i].quantity))
    }

    res.render('realm/detail', { realmInfo: realmInfo, itemHistoricalData: itemHistoricalData, pricingDates: pricingDates, pricingData: pricingData, pageName: "Detailed Info", pageDescription: realmInfo.name + 's historical marketplace data on an item.' })
})

router.post('/:realmSlug/:itemId', isLoggedIn, (req, res) => {
    console.log("REALM ID:", req.body.realmId)
    db.monitoredItem.findOrCreate({
        where: {
            userId: req.user.id,
            itemId: req.params.itemId,
            realmId: req.body.realmId,
            connectedRealmId: req.body.connectedRealmId
        }
    })
        .then(([monitoredItem, created]) => {
            if (created) {
                req.flash('success', 'Item has been added to your monitored items!')
                res.redirect(`/realms/${req.params.realmSlug}/${req.params.itemId}`)
            } else {
                req.flash('info', 'Item already exist in your monitored items')
                res.redirect(`/realms/${req.params.realmSlug}/${req.params.itemId}`)
            }
        })
})

module.exports = router
