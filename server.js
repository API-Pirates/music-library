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
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');


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
var arrayOfObject = [];

app.get('/', handleHomePage);
app.get("/searches/songs", handleSongsSearches);
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
    res.render('index')
}

function handleSongsSearches(req, res) {

    songsData(req.query.q, res);

}

function songsData(searchQuery, res) {
    let query = {
        apikey: process.env.SONG_API_KEY,
        q: searchQuery,
        page_size: 10,
        page: 1,
        s_track_rating: "desc"
    }

    let url = "http://api.musixmatch.com/ws/1.1/track.search";

    superAgent.get(url).query(query)
        .then(data => {
            let songs = JSON.parse(data.text).message.body.track_list;


            testFunction(songs)
                .then(data => {
                    res.send(arrayOfObject);
                })
                .catch(error => {
                    console.log('Error from the test function', error);
                })
            // songs.forEach(song => {
            //     lyricsData(songs.artist_name, songs.track_name).then(data => {
            //         console.log("Inside inner then");
            //         song.lyrics = data;
            //         arrayOfObject.push(new Song(song.track));
            //     }).catch(error => {
            //         console.log('Error from the lyricsData function', error);
            //     });
            // });
            // console.log('Before res.send');
            // res.send(arrayOfObject);
        })
        .catch(error => {
            console.log('Error getting the data from song API, ', error);
        })
}


function lyricsData(artist, song) {

    console.log("artist", artist);
    console.log("song", song);
    let query = {
        apiaryApiKey: process.env.LYRICS_API_KEY
    }

    let url = `https://api.lyrics.ovh/v1/${artist}/${song}`;

    return superAgent.get(url).query(query)
        .then(data => {
            console.log("Inner from the lyricsData superagent");
            return data.body.lyrics;
        })
        .catch(error => {
            console.log('Error occurred while getting the lyrics', error);
        })
}

// .............................................................................. data model
function Song(song) {
    console.log('The data passed to the construct', song);
    let genre;

    if (song.primary_genres.music_genre_list.length === 0) {
        genre = "UNKNOWN";
    } else {
        genre = song.primary_genres.music_genre_list[0].music_genre.music_genre_name;
    }

    this.title = song.track_name;
    this.artist = song.artist_name;
    this.album = song.album_name;
    this.rating = song.track_rating;
    this.genre = genre;
    this.lyrics = song.lyrics || "none";
    this.image_url = song.image_url || "none";
}



// Don't touch ever
var testFunction = function (songs) {
    return new Promise((resolved, rejected) => {

        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            lyricsData(song.track.artist_name, song.track.track_name).then(data => {
             
                song.track.lyrics = data;
                arrayOfObject.push(new Song(song.track));
                if (i === songs.length - 1) {
                    resolved(true);
                }
            }).catch(error => {
                console.log('Rejected called from testPromise', error);
                rejected(false);
            });
        }
    })
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