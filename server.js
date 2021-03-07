'use strict';
// .......................................................................... IMPORTS
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const override = require('method-override');
const superAgent = require('superagent');
const { json, query } = require('express');
// ........................................................................... CONFIGURATIONS
const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(override('_method'));

const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false }
// });

// .............................................................................. ROUTES
app.get('/', handleHomePage);

app.get("/searches/songs", handleSongsSearches);


var arrayOfObject = [];


// app.get("*", handleError);

// ............................................................................... FUNCTIONS
function handleHomePage(req, res) {

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































// .............................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on http://localhost:' + PORT) })
    })
    .catch(error => console.log(error + ' error'));