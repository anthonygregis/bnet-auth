const express = require('express')
const router = express.Router()
const db = require('../models')
const { Op } = require("sequelize");

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
        order: [
            ['quantity', 'DESC']
        ],
        limit: 10
    })

    res.render('realm/index', { realmInfo: realmInfo, mostAvailableItems: mostAvailableItems })
})

module.exports = router
