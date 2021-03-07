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
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// .............................................................................. ROUTES

app.get('/', handleHomePage);
app.get("/datasong", handlesongbage);
app.get("/songs/:id", handleSong);
app.get('/events', handleEvents);
app.get("/events/:id", handleOneEvent);
app.delete("/deleteData/:id", deletehandler);
app.delete("/deleteDataEvent/:id", deletehandlerEvent);
app.get('/about', handleAboutUs);
app.get('/contact', handleContact);

app.get("/dataevent", handleEvent);

app.get('*', handle404)
// ............................................................................... Handlers
function handleHomePage(req, res) {
    res.render('index');
}

function handleEvent(req, res) {
    getDAtaForEvent().then(data => {
        res.render('pages/dataevent', { data: data });
    })
}

function handleOneEvent(req, res) {
    getOneEvents(req.params.id).then(data => {
        res.render('pages/detailEvent', { data: data })
    })
}

function handleSong(req, res) {
    getOneSongs(req.params.id).then(data => {
        res.render('pages/detail', { data: data });
    })
}

function getOneSongs(id) {
    let findBook = 'SELECT * FROM song WHERE id =$1'
    return client.query(findBook, [id]).then(data => {
        return data.rows[0];
    })
}

function handlesongbage(req, res) {
    getdataFromDb().then(data => {
        res.render('pages/datasong', { data: data });
    });
}

function deletehandlerEvent(req, res) {
    let sql = 'DELETE from event where id=$1'
    let value = [req.params.id];
    client.query(sql, value).then(() => {
        res.redirect("pages/dataEvent");
    })
}

function deletehandler(req, res) {
    let sql = 'DELETE from song where id=$1'
    let value = [req.params.id];
    client.query(sql, value).then(() => {
        res.redirect("pages/datasong");
    });
}


function handleAboutUs(req, res) {
    res.render('pages/aboutUs')
}
function handleContact(req, res) {
    res.render('pages/contact')
}

function handle404(req, res) {
    res.render('error')
}
// ............................................................................... FUNCTIONS
function getOneEvents(id) {
    let findBook = 'SELECT * FROM event WHERE id =$1'
    return client.query(findBook, [id]).then(data => {
        return data.rows[0];
    })
}

function getDAtaForEvent() {
    let myData = "select * from event;"
    return client.query(myData).then(data => {
        return data.rows;
    })

}

function getdataFromDb() {
    let myData = "select * from song;"
    return client.query(myData).then(data => {
        return data.rows;
    })
}
function handleEvents(req, res) {
    let searchQuery = req.query.artist;

    let eventURL = 'https://rest.bandsintown.com/artists/' + searchQuery + '/events';
    let date = 'upcoming';

    let query = {
        app_id: process.env.app_id,
        date: date

    }
    superAgent.get(eventURL).query(query).then(data => {
        let dataArray = data.body;
        // console.log(dataArray);
        if (dataArray.length === 0) {
            let result = 'No upcoming events for now, search again later :)'
            res.status(200).send(result);
        } else {
            dataArray.forEach((event) => {
                if (event.length !== 0) {
                    let eventObject = new EventConstructor(event.offers[0].url, event.offers[0].status, event.venue.country, event.venue.city, event.venue.name, event.venue.region, event.datetime, event.on_sale_datetime, event.description);
                    res.status(200).send(eventObject);
                }
            });
        }
    }).catch(error => {
        console.log(error + "Error of superAgent");
    })
}
// ............................................................................... 
//  database queries
// let insertQuery = 'INSERT INTO song (title, artist, album, rating, genre, lyrics image_url) VALUES ();';
// let insertSafeValues = [];

// client.query(insertQuery, insertSafeValues)
//     .then(data => {

//     }).catch(error => {
//         console.log('Error : ', error);
//     })

// // .............................
// let selectQuery = 'SELECT * FROM song;';
// client.query(selectQuery)
//     .then(data => {

//     }).catch(error => {
//         console.log('Error : ', error);
//     })
// // .............................
// let deleteQuery = 'DELETE * FROM song WHERE id=' + req.params.id + ';';
// let deleteSafeValue = []
// client.query(deleteQuery)
//     .then(data => {

//     }).catch(error => {
//         console.log('Error : ', error);
//     })
// // ............................
// let updateQuery = 'UPDATE song SET title =$1, artist = $2, album = $3, rating = $4, genre = $5, lyrics = $6, image_url = $7 where ' + req.params.id + ';';
// let updateSafeValue = []
// client.query(updateQuery, updateSafeValue)
//     .then(data => {

//     }).catch(error => {
//         console.log('Error : ', error);
//     })
// ............................................................................... 

// .............................................................................. CONSTRUCTOR

function EventConstructor(offers, status, country, city, name, region, datetime, on_sale_datetime, description) {
    this.offers = offers;
    this.status = status;
    this.country = country;
    this.city = city;
    this.name = name;
    this.region = region;
    this.datetime = datetime;
    this.on_sale_datetime = on_sale_datetime;
    this.description = description;
};


// .............................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on' + PORT) });
    })
    .catch(error => { console.log('error', error) });