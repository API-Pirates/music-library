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


}


// .............................................................................. CONNECTION

client.connect()
    .then(() => {
        app.listen(PORT, () => { console.log('app is running on http://localhost:' + PORT) })
    })
    .catch(error => console.log(error + ' error'));