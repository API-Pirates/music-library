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

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(override('_method'));
app.use(express.urlencoded({extended:true}))



const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false }
// });
// .............................................................................. ROUTES
app.get('/', handleHomePage);
app.get('/events', handleEvents);
app.post('/saveEvent', saveToDB);
app.get('/dataBaseEvents', handleDataBaseEvents);






// ............................................................................... FUNCTIONS
function handleHomePage(req, res) {
    res.render('index');
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
           finalRes= result; 
      

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
                if (event.length !== 0 ) {
                    // image = dataArray[0].artist.thumb_url;
                    //         artistName = dataArray[0].artist.name;
                    //         fbpage = dataArray[0].artist.facebook_page_url;
                    
                    let eventObject = new EventConstructor(event.offers[0].url, event.offers[0].status, event.venue.country, event.venue.city, event.venue.name, event.venue.region, event.datetime, event.on_sale_datetime, event.description, artistName, image ,fbpage);

                    // console.log(eventObject); 
                    finalRes.push(eventObject); 
                    // console.log(finalRes); 
                }
            });
        }
        // res.status(200).send(finalRes);
        res.render('eventResult' , {searchResults : finalRes}); 
  
    }).catch(error => {
        console.log(error + "Error of superAgent");
    })

    
}

 function saveToDB(req, res){
    var finalRes = []; 
    var result = 'No upcoming events for now, search again later :)'
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



    client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on' + PORT) })
    })
    .catch(error => console.log(error + ' error'));