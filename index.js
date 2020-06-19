const express = require('express');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
require('dotenv').config();

const pass = process.env.atlaspass;

// Connect to the db
const atlasUri = `mongodb+srv://kd:${pass}@cluster0-lmcot.mongodb.net/test?retryWrites=true&w=majority`;

//const dbclient = new MongoClient(atlasUri, {useNewUrlParser: true, useUnifiedTopology: true});
async function sendToAtlasDB() {
    let dbclient;
    try {
        // Connect to the MongoDB cluster
        dbclient = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });
        await dbclient.connect();
        await createListing(dbclient, dataRec);
        //await getFromDB(dbclient).catch(console.error);
        //console.log('getFromDB Fn OVER!!');
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await dbclient.close();
        console.log('DataBase Closed!!!!');
    }
}


//older Kd function
let dbCursorArr = [];
async function getFromDB(client) {
    try {
        client.db("covidwords").collection("words").find({}).project({ _id: 0, userLat: 0, userLong: 0 }).sort({ timeStamp: -1 }).toArray(function (err, cursorReceived) {
            console.log(cursorReceived); //to be commented
            dbCursorArr = cursorReceived;
        });
    } catch (e) {
        console.error(e);
    }
    // finally {
    //     await client.close();
    // }
}
//older KD function


async function createListing(client, newListing) {
    const result = await client.db("covidwords").collection("words").insertOne(newListing)
        .then(() => console.log(`inserted sucessfully`))
        .catch(err => console.log(`failed to insert item with error ${err}`));
}

//techSam's addition
function getCount() {
    return new Promise((resolve, reject) => {
        counterFn().then(res => {
            resolve(res);
        })
    });
}
let counterFn = function () {
    return new Promise((resolve, reject) => {
        let dbclient = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });
        dbclient.connect(function (err, database) {
            database.db("covidwords").collection("words").estimatedDocumentCount({}, function (err, result) {
                if (err) {
                    console.log('error from the callback : ' + err.message);
                    reject(0);
                }
                else {
                    console.log("Estimated Count : " + result);
                    resolve(result);
                }
            });
        });
    });
}


let getTotalWords = function () {
    return new Promise((resolve, reject) => {
        let dbclient = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });
        dbclient.connect(function (err, database) {
            database.db("covidwords").collection("words").find({}).project({ _id: 0, userLat: 0, userLong: 0 }).sort({ timeStamp: -1 }).toArray(function (err, cursorReceived) {
                if (err) {
                    reject("something shit is happening");
                } else {
                    //console.log('cursor Received ' + JSON.stringify(cursorReceived));
                    resolve(cursorReceived);
                    dbclient.close();
                }
            });
        });
    });
}


const app = express();
const port = process.env.PORT || 4040;

app.listen(port, () => {
    console.log(`Starting server at ${port}`);
});
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

let dataRec = {};

app.post('/api', (req, res) => {
    console.log(req.body);
    dataRec = req.body;

    if (dataRec.userLat === null) {
        dataRec.city = null;
        dataRec.country = null;
        saveToDb();
    }
    res.json({
        status: 'success',
        timeSt: new Date(dataRec.timeStamp).toLocaleString(),
        latitude: dataRec.userLat,
        longitude: dataRec.userLong,
        userInputWord: dataRec.userInput,
    });
});

function getWords() {
    return new Promise((resolve, reject) => {
        getTotalWords().then(res => {
            resolve(res);
        })
    });
}


app.get('/words', (request, response) => {
    getWords().then(function (data) {
        response.json(data);
    })
});

app.get("/count", function (req, res) {
    getCount().then(function (data) {
        res.json(data);
    })
})

app.get('/revGeo/:latlon', async (request, response) => {
    const latlon = request.params.latlon.split(',');
    //console.log(latlon);
    const lat = latlon[0];
    const lon = latlon[1];
    //console.log(lat, lon);
    const apiKey = process.env.API_KEY;
    const apiURL = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lon}&format=json&addressdetails=1&normalizecity=1`;
    const responseLocn = await fetch(apiURL);
    const responseLocnJson = await responseLocn.json();
    dataRec.city = responseLocnJson.address.city;
    dataRec.country = responseLocnJson.address.country;

    saveToDb();
    response.json(responseLocnJson);
});

function saveToDb() {
    sendToAtlasDB().catch(console.error);
}

