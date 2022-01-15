const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('bson');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjpam.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('nextAdminPanel'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("next admin panel")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const clientCollection = client.db("nextAdminPanel").collection("client");

  app.post('/addClient', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const status = req.body.status;
    const password = req.body.password;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    clientCollection.insertOne({ name, email, phone, status, password, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/allClients', (req, res) => {
        clientCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/client/:email/:password', (req, res) => {
        clientCollection.findOne({email: ObjectId(req.params.email)} && {password: ObjectId(req.params.password)})
        .then(result => {
          res.send(documents);
        })
      })

    // app.get('/client/:email/:password', function(req, res) {
    //     var data = {
    //         "fruit": {
    //             "apple": req.params.fruitName,
    //             "color": req.params.fruitColor
    //         }
    //     }; 
    
    //     send.json(data);
    // });

    app.delete('/delete/:id', (req, res) => {
        clientCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
          res.send(result.deletedCount > 0);
        })
      })

    // app.get('/popularTours', (req, res) => {
    //     toursCollection.find({})
    //     .toArray((err, documents) => {
    //         res.send(documents);
    //     })
    // });

    // app.get('/booking/:tourId', (req, res) => {
    //     const id = req.params.tourId;
    //     const o_id = new ObjectId(id);
    //     toursCollection.find({_id: o_id})
    //     .toArray((err, documents) => {
    //         res.send(documents[0]);
    //     })
    // });

});

app.listen(process.env.PORT || port);