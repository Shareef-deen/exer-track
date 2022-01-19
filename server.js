const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
require('dotenv').config()
const {Schema} = mongoose;

mongoose.connect(process.env.DB_PASS, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new Schema({username: String});
const username = mongoose.model("username", schema);


app.use(cors())
app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res)=>{
  console.log(req.body.username);
  const user = req.body.username;
  username.create({username: user}, (err, data)=>{
    if (err) return console.error(err);
    res.send(data);
  })
})

/*app.get('/api/users', (req, res)=>{
  username.find({}).toArray(err, data)=>{
    if(err) return console.error(err);
    else {
    res.send(JSON.stringify(data));
    }
  })
})


*/
app.get('/api/users', (req, res)=>{
  username.find({}, (err, data)=>{
    if(err) return console.error(err);
    else{
      const staff = JSON.stringify(data);
      res.send(staff);
    }
  })
})

app.post('/api/users/:_id/exercises', (req, res)=>{
const id = req.body[':_id'];
const des = req.body.description;
const dur = req.body.duration;
const date = req.body.date;
console.log(id)
multi.create({userid: id, description: des, duration: dur, date: date}, (err, data)=>{
  if (err) return console.error(err);
  else{
    res.send(data);
  }
})

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
