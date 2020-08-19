const express = require('express')
const router = express.Router()
const db = require('../models')
const { Op } = require("sequelize");

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

    //Get Items Info
    let mostAvailableItems = await db.pricingData.findAll({
        where: {
            connectedRealmId: realmInfo.connectedRealm.id
        },
        attributes: ['itemId', [db.sequelize.fn('COUNT', db.sequelize.col('itemId')), 'totalListings']],
        order: [
            [[db.sequelize.literal('totalListings'), 'DESC']]
        ],
        limit: 10
    })

    res.render('realm/index', { realmInfo: realmInfo, mostAvailableItems: mostAvailableItems, pageName: realmInfo.name, pageDescription: realmInfo.name + 's historical marketplace data and most popular items currently.' })
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
            ['createdAt', 'DESC']
        ]
    })

    res.render('realm/detail', { realmInfo: realmInfo, itemHistoricalData: itemHistoricalData, pageName: "Detailed Info", pageDescription: realmInfo.name + 's historical marketplace data on an item.' })
})

module.exports = router
