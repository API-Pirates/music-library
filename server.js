'use strict';

// .......................................................................... IMPORTS
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const override = require('method-override');
const superAgent = require('superagent');

// ........................................................................... CONFIGURATIONS
const app = express();
app.use(cors());

app.use(override('_method'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false }
// })

// ................................................................................. ROUTES
app.get('/', handleHomePage);
app.get('/searches/songs', handleSongsearch)
// ............................................................................... HANDLERS
function handleHomePage(req, res) {
    res.render('index');
}

// ............................................................................... FUNCTIONS


// .............................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on http://localhost:' + PORT) })
    })
    .catch(error => console.log(error + ' error'));