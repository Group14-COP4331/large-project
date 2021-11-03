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


app.listen(PORT, () => { console.log('Server listening on port ' + PORT); }); // start Node + Express server on port 5000