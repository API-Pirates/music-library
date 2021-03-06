'use strict';

const youtubeUrl = "https://youtube.googleapis.com/youtube/v3/search?q=sia unstoppable&key=AIzaSyBgNqjdZgwATQEtTx8ZXCrW9eZDt8pSUmg&type=video"
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const override = require('method-override');
const superAgent = require('superagent');
var arrayOfObject = []

// ........................................................................... CONFIGURATIONS
const app = express();
app.use(cors());
app.use(override('_method'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT;
// const client = new pg.Client(process.env.DATABASE_URL);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// .............................................................................. ROUTES

app.get('/', handleHomePage);

app.post('/saveEvent', saveToDB);
app.get('/dataBaseEvents', handleDataBaseEvents);
app.get('/about', handleAboutUs);
app.get('/contact', handleContact);

/*songs*/
app.get("/songs", handleSongsSearches);
app.get("/datasong", handlesongpage);//list of all songs 
app.get("/songs/:id", handleSong);//view single song
app.post('/songs/add', handleAddSong)  // add song to database
// app.get("/searches/songs", handleSongsSearches);
app.delete("/deleteData/:id", deletehandler);//delete one song
app.put("/updateData/:id", handleupdateSong) // update data for one song 

// events
app.get("/dataevent", handleEvent);//list all event
app.get('/events', handleEvents);
app.get("/events/:id", handleOneEvent);///view single event 
app.delete("/deleteDataEvent/:id", deletehandlerEvent); // remove event

app.get('*', handle404); // handle 404 router

// ............................................................................... Handlers

function handleAddSong(req, res) {
    const { title, artist, album, rating, genre, image_url } = req.body

    let lyricsQuery = {
        apiaryApiKey: process.env.LYRICS_API_KEY
    }

    let url = `https://api.lyrics.ovh/v1/${artist}/${title}?`

    superAgent.get(url).query(lyricsQuery)
        .then(data => {
            let lyrics = data.body.lyrics
            let insertQuery = 'INSERT INTO song (title, artist, album, rating, genre, lyrics, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7);';
            let insertSafeValues = [
                title, artist, album, rating, genre, lyrics, image_url
            ];
            client.query(insertQuery, insertSafeValues)
                .then(() => {
                    res.redirect('/datasong');
                }).catch(error => {
                    console.log('Error : ', error);
                })
        })
        .catch(error => {
            console.log('Error occurred while getting the lyrics', error);
        })
}


function handleHomePage(req, res) {
    // show top rated songs and interesting events
    let topRated = [];
    let randomEvents = []
    let ratingQuery = 'SELECT title, rating, image_url, artist FROM song ORDER BY rating DESC LIMIT 5;';

    let eventsQuery = 'SELECT * FROM event LIMIT 3;';

    client.query(ratingQuery).then(data => {
        topRated = data.rows;

        client.query(eventsQuery).then(data => {
            randomEvents = data.rows;
            res.render('index', { events: randomEvents, ratedSongs: topRated })
        });
    })
}

function handleSongsSearches(req, res) {
    let { searchBy, formatInput } = req.query;
    let query = {
        apikey: process.env.SONG_API_KEY,
        page_size: 10,
        page: 1,
        s_track_rating: "desc"
    }

    query[searchBy] = formatInput;


    // console.log(query);

    arrayOfObject = [];

    let url = "http://api.musixmatch.com/ws/1.1/track.search";

    superAgent.get(url).query(query)
        .then(data => {
            let songs = JSON.parse(data.text).message.body.track_list;

            testFunction(songs)
                .then(data => {
                    res.render("pages/searches", { songSearches: arrayOfObject });
                })
                .catch(error => {
                    console.log('Error from the test function', error);
                })

        })
        .catch(error => {
            console.log('Error getting the data from song API, ', error);
        })
}



function youtubeData(artist, song) {
    let mySearch = `${artist} ${song}`
    let query = {
        q: mySearch,
        key: process.env.YOUTUBE_KEY,
        type: "video",
        maxResults: 1
    }
    // https://youtube.googleapis.com/youtube/v3/search?q=sia unstoppable&key=AIzaSyBgNqjdZgwATQEtTx8ZXCrW9eZDt8pSUmg&type=video

    let url = `https://youtube.googleapis.com/youtube/v3/search`;

    return superAgent.get(url).query(query)
        .then(data => {

            return JSON.parse(data.text).items[0].id.videoId;
        })
        .catch(error => {
            console.log('Error occurred while getting the lyrics', error);

        })

        function saveToDB(req, res) {
    var finalRes = [];
    var result = 'No upcoming events for now, search again later :)'
    let dataArray = req.body;
    // console.log(dataArray.description);

    let InsertQuery = 'INSERT INTO event(event_url, status, country, city, region, name, date, saleDate, image_url, description, artistName, facebook_page_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12) RETURNING *;';
    let safeValues = [dataArray.offers, dataArray.status, dataArray.country, dataArray.city, dataArray.region, dataArray.namePlace, dataArray.datetime, dataArray.on_sale_datetime, dataArray.image_url, dataArray.description, dataArray.artistName, dataArray.facebook_page_url];
    client.query(InsertQuery, safeValues).then((data) => {
        res.redirect('/dataBaseEvents');
        console.log('added to the database');

    }).catch(error => {
        console.log('we have an error' + error);
    });
}
}
function handleDataBaseEvents(req, res) {
    let sql = `SELECT * FROM event`;
    client.query(sql).then(data => {
        console.log(data.rows);
        res.render('dataBaseEvents', { eventResults: data.rows });
    }).catch(error => {
        console.log('error on rendering events from DB', error);
    });
}

var testFunction = function (songs) {
    return new Promise((resolved, rejected) => {

        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            youtubeData(song.track.artist_name, song.track.track_name).then(data => {

                song.track.youtube = data;

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

// .............................................................................. data model

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
        // console.log(data);
        res.render('pages/detail', { data: data });

    })
}

function getOneSongs(id) {
    let findBook = 'SELECT * FROM song WHERE id =$1'
    return client.query(findBook, [id]).then(data => {
        return data.rows[0];
    })
}

function handlesongpage(req, res) {
    getdataFromDb().then(data => {
        res.render('pages/datasong', { data: data });
    });
}

function deletehandlerEvent(req, res) {
    let sql = 'DELETE from event where id=$1'
    let value = [req.params.id];
    client.query(sql, value).then(() => {
        res.redirect('/dataBaseEvents');
    })
}

function deletehandler(req, res) {
    let sql = 'DELETE from song where id=$1'
    let value = [req.params.id];
    client.query(sql, value).then(() => {
        res.redirect("/datasong");
    });
}
function handleupdateSong(req, res) {
    let formData = req.body;
    // console.log(formData);
    let safeValues = [formData.title, formData.artist, formData.album, formData.rating, formData.genre, formData.lyrics, req.params.id];
    let mydata = `UPDATE song SET title=$1,artist=$2,album=$3,rating=$4,genre=$5 ,lyrics=$6 WHERE id=$7;`
    client.query(mydata, safeValues).then(() => {
        res.redirect(`/songs/${req.params.id}`)
    })
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
    let myData = "SELECT * FROM event;"
    return client.query(myData).then(data => {
        return data.rows;
    })
}


function getdataFromDb() {
    let myData = "SELECT * FROM song;"
    return client.query(myData).then(data => {
        return data.rows;
    })
}

function handleEvents(req, res) {
    var finalRes = [];
    let searchQuery = req.query.artist;
    var result = ['No upcoming events for now, search again later :)'];

    let eventURL = 'https://rest.bandsintown.com/artists/' + searchQuery + '/events';

    let date = 'upcoming';

    let query = {
        app_id: process.env.app_id,
        date: date

    }
    superAgent.get(eventURL).query(query).then(data => {
        var dataArray = data.body;

        if (dataArray.length === 0) {
            // let result = 'No upcoming events for now, search again later :)'; 
            finalRes = result;
        } else {
            let image;
            let artistName;
            let fbpage;

            if (dataArray[0].artist) {
                image = dataArray[0].artist.thumb_url;
                artistName = dataArray[0].artist.name;
                fbpage = dataArray[0].artist.facebook_page_url;
            }

            dataArray.forEach((event) => {
                if (event.length !== 0) {

                    let eventObject = new EventConstructor(event.offers[0].url, event.offers[0].status, event.venue.country, event.venue.city, event.venue.name, event.venue.region, event.datetime, event.on_sale_datetime, event.description, artistName, image, fbpage);

                    finalRes.push(eventObject); 
                }
            });
        }
        res.render('pages/eventResult', { searchResults: finalRes });

    }).catch(error => {
        console.log(error + "Error of superAgent");
    })


}

function saveToDB(req, res) {
    var finalRes = [];
    var result = 'No upcoming events for now, search again later :)'
    let dataArray = req.body;
    // console.log(dataArray.description);

    let InsertQuery = 'INSERT INTO event(event_url, status, country, city, region, name, date, saleDate, image_url, description, artistName, facebook_page_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12) RETURNING *;';
    let safeValues = [dataArray.offers, dataArray.status, dataArray.country, dataArray.city, dataArray.region, dataArray.namePlace, dataArray.datetime, dataArray.on_sale_datetime, dataArray.image_url, dataArray.description, dataArray.artistName, dataArray.facebook_page_url];
    client.query(InsertQuery, safeValues).then((data) => {
        res.redirect('/dataBaseEvents');
        console.log('added to the database');

    }).catch(error => {
        console.log('we have an error' + error);
    });
}

function handleDataBaseEvents(req, res) {
    let sql = `SELECT * FROM event`;
    client.query(sql).then(data => {
        // console.log(data.rows);
        res.render('dataBaseEvents', { eventResults: data.rows });
    }).catch(error => {
        console.log('error on rendering events from DB', error);
    });
}


// .............................................................................. CONSTRUCTOR
function EventConstructor(offers, status, country, city, name, region, datetime, on_sale_datetime, description, artistName, thumb_url, facebook_page_url) {

    this.offers = offers || "Unavailable";
    this.status = status || "Unavailable";
    this.country = country? country: 'USA';
    this.city = city || "Unavailable";
    this.namePlace = name || "Unavailable";
    this.region = region || "Unavailable";
    this.datetime = datetime;
    this.on_sale_datetime = on_sale_datetime || "Unavailable";
    this.description = description ? description : 'No information on the event';
    this.artistName = artistName || 'unknown value';
    this.thumb_url = thumb_url ? thumb_url : "No Title Available";
    this.facebook_page_url = facebook_page_url || "Unavailable";

};

let singers = ['adele', 'amr diab', 'chris brown', 'david Guetta', 'drake', 'dua lipa', 'ed sheeran', 'eminem', 'imagine dragons', 'justin bieber', 'katy perry', 'maroon 5', 'metallica', 'rihanna', 'sia'];

function Song(song) {
    // console.log('The data passed to the construct', song);
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
    this.youtube = song.youtube;
    this.lyrics = song.lyrics || "none";
    singers.forEach(singer => {
        if (singer === this.artist) {
            this.image_url = `images/Singers/${this.artist.toLowerCase()}.jpg`;
        } else {
            this.image_url = "images/default2 song.jpg";
        }
    })
}

// .............................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on' + PORT) })
    }) .catch(error => console.log(error + ' error'));
