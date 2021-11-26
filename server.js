const path = require('path'); 
const PORT = process.env.PORT || 5000;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(bodyParser.json());

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));
    app.get('*',(req,res) =>
    {
        res.sendFile(path.resolve(__dirname,'client', 'build', 'index.html'));
    });
}
require('dotenv').config();

const url = process.env.MONGODB_URL;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});



app.post('/api/login', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error

  var error = '';

  const { email, password } = req.body;
  const db = client.db();
  const results = await db.collection('Users').find({email:email, password:password}).toArray();
  var id = -1;
  var un = '';
  if (results.length>0)
    {
        id = results[0]._id;
        un = results[0].username;
    }
  var ret = {id:id, username: un, error:''};
  res.status(200).json(ret);

});

app.post('/api/userExists', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error

  var error = '';

  const { username } = req.body;
  const db = client.db();
  const results = await db.collection('Users').find({username: username}).toArray();
  var ret;
  if (results.length>0)
        ret = { exists : 1};
    else
        ret = { exists : 0};

  res.status(200).json(ret);

});

app.post('/api/registerUser', async (req, res, next) =>
{
    // inc: username, password, email
    // out: error
    var error = "0";
    const { username, password, email } = req.body;
    const assets = new Array(20).fill(false);
    assets[0] = true;
    const db = client.db();
    const feed = { username : username, password: password, email : email, coins : 0, topscore : 0, 
                   assets : assets, verified : false, verifyCode : null}
    if (!(username == null || password == null || email == null))
    {
        db.collection('Users').insertOne(feed, function (err, res) {
            if (err) error = "1"
        });
    } else { error = "1"}
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/changeUser', async (req, res, next)=>
{
    //inc: username, password, newUsername
    //out: error
    var error = "0";
    const {username, password, newUsername} = req.body;
    const db = client.db();
    if(newUsername != null)
    { 
        const results = db.collection('Users').updateOne({username:username, password:password},
                                        { $set: { username: newUsername }});
        if((await results).matchedCount == 0) error = '1';
    }
    const ret = { error: error }
    res.status(200).json(ret)
});

app.post('/api/changePassword', async (req, res, next) => {
    //inc: username, password, newPass
    //out: error
    var error = "0";
    const { username, password, newPass } = req.body;
    const db = client.db();
    if (newPass != null) {
        const results = db.collection('Users').updateOne({ username: username, password: password },
            { $set: { password: newPass } });
        if ((await results).matchedCount == 0) error = '1';
    }
    const ret = { error: error }
    res.status(200).json(ret)
});

app.post('/api/sendEmail', async (req, res, next) =>{
    // inc: email
    //out: error
    var nodemailer = require('nodemailer');
    var error = '0';
    const { email } = req.body;
    const db = client.db();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dungeonride@gmail.com',
            pass: process.env.EMAIL_PASS,
        }
    });
    const code = Math.floor(1000 + Math.random() * 9000);
    var mailOptions = {
        from: 'dungeonride@gmail.com',
        to: email,
        subject: 'Your Code Contained Here ',
        text: code.toString(),
    };
    const results = db.collection('Users').updateOne({ email: email},
        { $set: { verifyCode: code } });
    if ((await results).matchedCount == 0) error = '1';

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            error = '1';
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    const ret = { error: error }
    res.status(200).json(ret);
});
app.post('/api/verifyCode', async (req, res, next) => {
    // inc: username, verifyCode
    //out: error
    const { username, verifyCode } = req.body;
    var error = '0';
    const db = client.db();
    console.log(typeof verifyCode);
    const results = await db.collection('Users').findOneAndUpdate({username: username, verifyCode : verifyCode}, {$set: {verifyCode:null, verified:true},
                    function(err,doc){
                        if (err) { throw err };
                    }});
    console.log(results);
    if (results.lastErrorObject.updatedExisting == false) {error = '1'};
    const ret = {error : error}
    res.status(200).json(ret);
});
app.listen(PORT, () => { console.log('Server listening on port ' + PORT); }); // start Node + Express server on port 5000
