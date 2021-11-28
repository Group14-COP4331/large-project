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
const { debug } = require('console');
const { ObjectId } = require('mongodb');
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
    const { email, password } = req.body;
    const db = client.db();
    const results = await db.collection('Users').find({email:email, password:password}).toArray();
    var id = -1;
    var un = '';
    var ver = false;
    if (results.length>0)
      {
          id = results[0]._id;
          un = results[0].username;
          ver = results[0].verified;
      }
    var ret = {id:id, verified: ver, username: un, error:''};
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

app.post('/api/getUserGameInfo', async (req, res, next)=>
{
    //inc: id
    //out: all user data, error
    var error = "0";
    const {id} = req.body;
    const db = client.db();
    var results = '';
    if(id != null)
    { 
        results = await db.collection('Users').find({_id : ObjectId(id)}, {projection : {_id : 0, coins: 1, topscore: 1, assets:1, }}).toArray();
        if(results.matchedCount == 0) error = 'No users found with that id';
    }
    else {
        error = 'Invalid input'
    }
    const ret = {user : results, error: error }
    res.status(200).json(ret)
});

app.post('/api/addUserGameSession', async (req, res, next)=>
{
    //inc: id, score
    //out: error
    var error = "0";
    const {id, score} = req.body;
    const db = client.db();
    var results = '';
    if(id != null)
    { 
        results = await db.collection('Users').find({_id : ObjectId(id)}).toArray();
    
        if (score > results[0].topscore) {
            await db.collection('Users').updateOne({_id : ObjectId(id)}, {$set : {topscore : score}});
            var leaderboardArr = await db.collection('Leaderboard').find().sort({position : 1}).toArray();
            var tmpUsername = results[0].username;
            var tmpScore = score;
            for (let i = 0; i < 10; i++) {
                if (tmpScore > leaderboardArr[i].score) {
                    await db.collection('Leaderboard').updateOne({_id : leaderboardArr[i]._id}, { $set : {username : tmpUsername, score : tmpScore}});
                    tmpUsername = leaderboardArr[i].username;
                    tmpScore = leaderboardArr[i].score;
                }
            }
        }
            
    }
    else {
        error = 'Invalid input';
    }
    const ret = {error: error }
    res.status(200).json(ret)
});

app.post('/api/changePassword', async (req, res, next) => {
    //inc: username, newPass
    //out: error
    var error = "0";
    const { username, newPass } = req.body;
    const db = client.db();
    if (newPass != null) {
        const results = db.collection('Users').updateOne({ username: username },
            { $set: { password: newPass } });
        if ((await results).matchedCount == 0) error = '1';
    }
    const ret = { error: error }
    res.status(200).json(ret)
});

app.post('/api/populateLeaderboard', async (req, res, next) => {
    //inc: none
    //out: error
    var error = "0";
    const db = client.db();
    const results = await db.collection('Users').find().sort({topscore: -1}).limit(10).toArray();
    
    var topscore = 0;
    var username = "";
    var position = 0;
    await db.collection('Leaderboard').deleteMany({});
    for (let i = 0; i < 10; i++) {
        topscore = results[i].topscore;
        username = results[i].username;
        position = i+1;
        const feed = {position : position, username : username, score : topscore};
        db.collection('Leaderboard').insertOne(feed, function(err, res){
            if (err) error = "1"
        });
    }
    const ret = { error: error }
    res.status(200).json(ret)
});

app.post('/api/getLeaderboard', async (req, res, next) => {
    //inc: none
    //out: leaderboard, error
    var error = "0";
    const db = client.db();
    const results = await db.collection('Leaderboard').find({}, {projection : {_id : 0}}).sort({position: 1}).toArray();
    
    const ret = { leaderboard: results, error: error }
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
        subject: 'Your Code Contained Here 😌',
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
    const results = await db.collection('Users').findOneAndUpdate({username: username, verifyCode : verifyCode}, {$set: {verifyCode:null, verified:true},
                    function(err,doc){
                        if (err) { throw err };
                    }});
    if (results.lastErrorObject.updatedExisting == false) {error = '1'};
    const ret = {error : error}
    res.status(200).json(ret);
});
app.post('/api/userFromEmail', async (req, res, next) => {
    // inc : email
    // out : username, rror
    const { email } = req.body;
    var error = '0';
    var username = '';
    const db = client.db();
    const results = await db.collection('Users').find({ email: email }).toArray();
    if (results.length == 0) {
        error = '1';
    } else {
        username = results[0].username;
    }
    const ret = { username: username, error: error }
    res.status(200).json(ret)
});
app.listen(PORT, () => { console.log('Server listening on port ' + PORT); }); // start Node + Express server on port 5000