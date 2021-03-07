'use strict';
// .......................................................................... IMPORTS
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const override = require('method-override');
const superAgent = require('superagent');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const { json } = require('express');
// ........................................................................... CONFIGURATIONS
const app = express();
app.use(cors())

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

app.get('/', handleHomePage)
app.get("/datasong",handlesongbage)
app.get("/songs/:id", handleSong)
app.get("/events/:id", handleOneEvent)
app.delete("/deleteData/:id",deletehandler)
app.delete("/deleteDataEvent/:id",deletehandlerEvent)

app.get('/', handleHomePage);
app.get('/events', handleEvents);


app.get("/dataevent",handleEvent)
// ............................................................................... FUNCTIONS
function handleHomePage(req, res) {
    res.render('index');
}

function handleEvent(req,res){
    getDAtaForEvent().then(data=>{

        res.render('dataevent',{data:data});
})}

function handleOneEvent(req,res){
    getOneEvents(req.params.id).then(data =>{
        res.render('detailEvent', {data:data})
    })

}

function getOneEvents(id){
    let findBook = 'SELECT * FROM event WHERE id =$1'
    return client.query(findBook,[id]).then(data=>{
        return data.rows[0];
    })
}

function getDAtaForEvent(){
    let myData="select * from event;"
    return client.query(myData).then(data => {
    return data.rows;
    })



}
function handleSong(req,res){
    getOneSongs(req.params.id).then(data =>{
        res.render('detail', {data:data})
    })

}

function getOneSongs(id){
    let findBook = 'SELECT * FROM song WHERE id =$1'
    return client.query(findBook,[id]).then(data=>{
        return data.rows[0];
    })
}
function handlesongbage(req,res){

    getdataFromDb().then(data=>{

        res.render('datasong',{data:data});
})
}
function getdataFromDb(){

    let myData="select * from song;"
    return client.query(myData).then(data => {
    return data.rows;
    })
}
function deletehandlerEvent(req,res){
    let sql='DELETE from event where id=$1'
let value=[req.params.id];
client.query(sql,value).then(()=>{
    res.redirect("/dataEvent");

})

}
function deletehandler(req,res){
    let sql='DELETE from song where id=$1'
let value=[req.params.id];
client.query(sql,value).then(()=>{
    res.redirect("/datasong");

})


app.get('/events', handleEvents);



function handleEvents(req,res) {
    let searchQuery = req.query.artist;
  

    let eventURL = 'https://rest.bandsintown.com/artists/'+ searchQuery +'/events';
    let date = 'upcoming';

    let query = {
        app_id: process.env.app_id,
        date: date
       
    }

    superAgent.get(eventURL).query(query).then (data => {
        let dataArray = data.body;
        // console.log(dataArray);
        if (dataArray.length === 0) {
            let result= 'No upcoming events for now, search again later :)'
            res.status(200).send(result);
        } else {
            dataArray.forEach((event) => {
                if (event.length !== 0) {
                    let eventObject = new EventConstructor(event.offers[0].url, event.offers[0].status, event.venue.country, event.venue.city, event.venue.name, event.venue.region, event.datetime, event.on_sale_datetime, event.description);
                    res.status(200).send(eventObject);
                }
            });
        }
    }).catch(error=>{
        console.log(error + "Error of superAgent");
    })

}
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

}


// .............................................................................. CONNECTION

client.connect()
.then(() => {
    app.listen(PORT, () => { console.log('app is running on' + PORT) })
}) .catch(error => console.log(error + ' error'));