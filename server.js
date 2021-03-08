'use strict';
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

app.get("/songs", handleSongsSearches);
app.get("/datasong", handlesongbage);

app.get("/songs/:id", handleSong);
app.get('/events', handleEvents);

app.post('/saveEvent', saveToDB);
app.get('/dataBaseEvents', handleDataBaseEvents);





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

var finalRes = []; 
var result = ['No upcoming events for now, search again later :)']; 

function handleSongsSearches(req, res) {

    let {searchBy, formatInput} = req.query;

    let query = {
        apikey: process.env.SONG_API_KEY,
        page_size: 10,
        page: 1,
        s_track_rating: "desc"
    }

    query[searchBy] = formatInput;

    console.log(query);

    let url = "http://api.musixmatch.com/ws/1.1/track.search";

    superAgent.get(url).query(query)
        .then(data => {
            let songs = JSON.parse(data.text).message.body.track_list;
            let arrayOfObject = []

            songs.forEach(song => {
                arrayOfObject.push(new Song(song.track));
            })

            res.render("pages/searches", {songSearches : arrayOfObject});
        .catch(error => {
            console.log('Error getting the data from song API, ', error);
        })
}

function handleEvents(req, res) {
    let searchQuery = req.query.artist;

    let eventURL = 'https://rest.bandsintown.com/artists/' + searchQuery + '/events';

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

// function getdataFromDb() {
//     let myData = "select * from song;"
//     return client.query(myData).then(data => {
//         return data.rows;
//     })
// }
function handleEvents(req, res) {
    finalRes = [];
    let searchQuery = req.query.artist;

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
            res.send("<h1> No upcoming events for now, search again later :) </h1>")
        } else {
            let image;
            let artistName;
            let fbpage;

            if(dataArray[0].artist){
                    image = dataArray[0].artist.thumb_url;
                    artistName = dataArray[0].artist.name;
                    fbpage = dataArray[0].artist.facebook_page_url;
            }      

            dataArray.forEach((event) => {
                    // image = dataArray[0].artist.thumb_url;
                    //         artistName = dataArray[0].artist.name;
                    //         fbpage = dataArray[0].artist.facebook_page_url;
                    
                    let eventObject = new EventConstructor(event.offers[0].url, event.offers[0].status, event.venue.country, event.venue.city, event.venue.name, event.venue.region, event.datetime, event.on_sale_datetime, event.description, artistName, image ,fbpage);

                    // console.log(eventObject); 
                    finalRes.push(eventObject); 
                    // console.log(finalRes); 
            });
            res.render('eventResult' , {searchResults : finalRes}); 

        }

  
    }).catch(error => {
        console.log(error + "Error of superAgent");
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


 function saveToDB(req, res){
    // var finalRes = []; 
    // var result = 'No upcoming events for now, search again later :)'
    let dataArray = req.body;
    // console.log(dataArray.description);

     let InsertQuery = 'INSERT INTO event(event_url, status, country, city, region, name, date, saleDate, image_url, description, artistName, facebook_page_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12) RETURNING *;'; 
     let safeValues = [dataArray.offers, dataArray.status, dataArray.country, dataArray.city, dataArray.region, dataArray.namePlace, dataArray.datetime, dataArray.on_sale_datetime,dataArray.image_url ,dataArray.description, dataArray.artistName, dataArray.facebook_page_url]; 
     client.query(InsertQuery, safeValues).then((data)=>{
         res.redirect('/dataBaseEvents');
         console.log('added to the database'); 
        
     }).catch(error =>{
         console.log('we have an error' + error); 
     });
 }

 function handleDataBaseEvents(req, res){

     let sql = `SELECT * FROM event`;
     client.query(sql).then(data =>{
         console.log(data.rows);
         res.render('dataBaseEvents', {eventResults : data.rows});

     }).catch(error=>{
         console.log('error on rendering events from DB', error); 

     });
 }
// ............................................................................... 

function EventConstructor(offers, status, country, city, name, region, datetime, on_sale_datetime, description, artistName,thumb_url,facebook_page_url){
    
    this.offers = offers;
    this.status = status;
    this.country = country;
    this.city = city;
    this.namePlace = name;
    this.region = region;
    this.datetime = datetime;
    this.on_sale_datetime = on_sale_datetime;
    this.description = description;

    this.artistName = artistName || 'unknown value';
    this.thumb_url = thumb_url? thumb_url : "No Title Available";
    this.facebook_page_url = facebook_page_url;
    


};

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
    this.lyrics = song.lyrics || "none";
    this.image_url = song.image_url || "none";
}






// .............................................................................. CONSTRUCTOR


// function EventConstructor(offers, status, country, city, name, region, datetime, on_sale_datetime, description) {
//     this.offers = offers;
//     this.status = status;
//     this.country = country;
//     this.city = city;
//     this.namePlace = name;
//     this.region = region;
//     this.datetime = datetime;
//     this.on_sale_datetime = on_sale_datetime;
//     this.description = description;


// }



//      // reading the ID from the database
//   let searchQuery = `SELECT * FROM book where title=$1;`;
//   let secureValues = [formBody.title];
//   client.query(searchQuery, secureValues).then(data => {
//     res.redirect(`/books/${data.rows[0].id}`);
//   }).catch(error => {
//       console.log(`error getting the id from the database, ${error}`);
//     })



// .............................................................................. CONNECTION
client.connect().then(() => {
    app.listen(PORT, () => { console.log('app is running on' + PORT) });
}).catch(error => console.log(error + ' error'));
