const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/:realmSlug', (req, res) => {
    db.realm.findOne({
        where: { slug: req.params.realmSlug },
        include: [
            {
                model: db.connectedRealm,
                include: {
                    model: db.pricingData,
                    include: {
                        model: db.item
                    }
                }
            }
        ]
    })
        .then(realmInfo => {
            res.send(realmInfo)
        })
        .catch(err => {
            console.log("ERROR:", err)
        })
})


module.exports = router
