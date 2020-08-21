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
            res.render('monitoring', {monitoredItems: monitoredItems})
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router