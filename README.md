# WoW Marketplace Tracker

My project 2 site designed to aggregate data from multiple World of Warcraft auction houses for historical use, monitoring current pricing, and predicting best times for listing items.

# Languages / Packages Used
- Node
- Express 
    - EJS
    - EJS Layouts
    - Express Passport
- BattleNet Passport Authentication
- HTML
- CSS
- Materialize

# How to Setup App

1. Sign up for a [Battle.Net account](https://us.battle.net/account/creation/flow/heal-up-full) and create an application on [Developer Portal](https://develop.battle.net/)

2. `git clone https://github.com/anthonygregis/bnet-auth.git` in terminal

3. `npm i` in terminal of root directory of project
    - Installs all our necessary packages for web server
    
4. Setup .env file for web server
    - BNET_ID=`Battle.Net Application ID`
    - BNET_SECRET=`Battle.Net Application Secret Key`
    - SECRET_SESSION=`Random string for express session`
    
5. Setup Sequelize Database
    - Run `sequelize init` to get a configuration file for connetions
    - Modify config file to be proper connections
    - Run `sequelize db:create` to get your database created
    - Run `sequelize db:migrate` to get all your proper tables
    
6. Start up web server `npm start`

7. Login using BNet and auto populate tables with servers from your characters
    - Prevents useless data aggregation

8. Install a data aggregation node on your server that connects to a setup MySQL DB.
    - git clone https://github.com/anthonygregis/auction-data-aggregation.git
    - Setup .env file
        - DB_NAME=`Name of database`
        - DB_HOST=`IP of database server`
        - DB_USER=`Database Username`
        - DB_PASS=`Database Password`
        - BNET_ID=`Battle.Net Application ID`
        - BNET_SECRET=`Battle.Net Application Secret Key`
    - Run `node index.js` (Runs on top of every hour automatically after)
    
# How To Use App

When a user logs into the server it will populate your users, characters, realms, and connectedRealms tables with necessary info to get auction data for those characters.

After running for a couple hours you should start to see historical data for items appearing on the site, users can check via multiple options.
- Going to realms page and choosing a realm
- Going to a character's realm page
- Checking global most available items

Users can pick a specific item from a realm and monitor that item to easily check favorite items from the multiple realms in the monitoring page.
They can also change the realm they want to monitor of an item if they change their mind.

# Pages

## Login `/auth/bnet`

This page redirects you to Battle.Net's login page and authorizes my server to make information calls on your behalf to the WoW API on a limited time access token.

## Login Callback `/auth/bnet/callback`

On return it inserts the user's unique id and battletag into users table, gets all their characters, realms, and connected realms for data aggregation.
Stores user's access_token with an 8 hour expire time into sequelize sessions table.

## Realms `/realms`

This page shows all currently available realms from the realm table

## Most Available `/items`

This page shows the most globally listed items inside of WoW

##### Get a distinct count of item's quantity for all realms
```javascript
//Get Items Info
  let mostAvailableItems = await db.sequelize.query(`SELECT DISTINCT(itemId), COUNT(quantity) 'totalQuantity' FROM pricingData GROUP BY itemId ORDER BY 'totalQuantity' LIMIT 40`, { type: QueryTypes.SELECT })
```

## Realm Info `/realms/${realm-slug}`

This Page shows off all the most available items for the server that this realm is on.

##### Code Snippets

Sequelize findAll query that returns 

```javascript
let mostAvailableItems = await db.pricingData.findAll({
        where: {
            connectedRealmId: realmInfo.connectedRealm.id,
            createdAt: {
                [Op.gt]: new Date(new Date() - 1 * 60 * 60 * 1000)
            }
        },
        attributes: ['itemId', 'quantity'],
        order: [
            ['quantity', 'DESC']
        ],
        limit: 10
    })
```

## Monitoring 

This page pulls all of a user's tracked items from specific realms and gives back the last hourly change.
Users can also change the realm of an item if they want, or delete it from monitored items.

##### Code Snippets

This sequelize query gets all of a user's monitored items from the monitoredItems table and subqueries their pricing data for the specific realm using the monitored item id.

```javascript
const monitoredItems = await db.sequelize.query(`
        SELECT *,
               (SELECT unitPrice / quantity
               FROM pricingData 
               WHERE pricingData.itemId = monitoredItems.itemId 
                 AND pricingData.connectedRealmId = monitoredItems.connectedRealmId
                 ORDER BY createdAt
                   LIMIT 1)
                   AS unitPrice,
               (SELECT quantity 
               FROM pricingData
               WHERE pricingData.itemId = monitoredItems.itemId 
                 AND pricingData.connectedRealmId = monitoredItems.connectedRealmId
                 ORDER BY createdAt
                   LIMIT 1) 
                   AS quantity,
               (SELECT slug
                FROM realms
                WHERE realms.connectedRealmId = monitoredItems.connectedRealmId)
                    AS realmSlug,
               (SELECT name
                FROM realms
                WHERE realms.connectedRealmId = monitoredItems.connectedRealmId)
                   AS realmName
        FROM monitoredItems
        WHERE monitoredItems.userId = ${req.user.id}
    `)
```

---

World of Warcraft, Warcraft, Battle.net and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.