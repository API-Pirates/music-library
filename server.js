'use strict';
// .......................................................................... IMPORTS
const express = require('express');
const cors = require('cors')
const pg = require('pg')
require('dotenv').config();
const override = require('method-override')
// ........................................................................... CONFIGURATIONS
const app = express();
app.use(cors())

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(override('_method'));

const PORT = process.env.PORT;
// const client = new pg.Client(process.env.DATABASE_URL)
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
// .............................................................................. ROUTES
app.get('/', handleHomePage)

// ............................................................................... FUNCTIONS
function handleHomePage(req, res) {
    res.render('index');
}
// .................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is runnin on http://localhost:' + PORT) })
    })
    .catch(error => console.log(error + ' error'))