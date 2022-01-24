const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
require('dotenv').config()
const {Schema} = mongoose;

mongoose.connect(process.env.DB_PASS, { useNewUrlParser: true, useUnifiedTopology: true });

//username
const UserSchema = new Schema({username: String});
const users = mongoose.model("username", UserSchema);

//other one
const ExerciseShcema = new Schema({
  userId: {type: String, required: true},
  description: String,
  duration: Number,
  date: { type: Date}

})
const exercise = mongoose.model("exercise", ExerciseShcema);


app.use(cors())
app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res)=>{
  console.log(req.body.username);
  const user = req.body.username;
  users.create({username: user}, (err, data)=>{
    if (err) return console.error(err);
    res.send(data);
  })
})


app.get('/api/users', (req, res)=>{
  users.find({}, (err, data)=>{
    if(err) return console.error(err);
    else{
      const staff = JSON.stringify(data);
      res.send(staff);
    }
  })
})

app.post('/api/users/:_id/exercises', (req, res)=>{
//const id = req.body[':_id'];
const id = req.params._id;
const des = req.body.description;
const dur = req.body.duration;
let date = req.body.date;
console.log(req.body)
console.log(id);
 if (date === ""){
    date = new Date().toDateString()
  } else {
    date = new Date(date).toDateString()
  }



users.findById(id, (err, userData)=>{
  if(err) return console.error(err);
  else{
    const newExercise = new exercise({
      userId: id,
      description: des,
      duration: dur,
      date: date
      
    })

    newExercise.save((err, exerciseData)=>{
      if(err || !exerciseData){
        console.log("error or no data")
      }
      else{
        res.send({
        username: userData.username,
       description: des,
       duration: parseInt(dur),
       date: date,_id: id
        })
      }
    })
  }
})

    
  
  
  

})

/*
app.get('/api/users/:_id/logs', (req, res)=>{
  const id = req.params._id;
  const {from, to, limit} = req.query;
  users.findById(id, (err, userData)=>{
    if (err) return console.error(err);
    else{
      let dateObj = {};
      if (from) {
        dateObj["$gte"] = new Date(from);
      }

      if(to) {
        dateObj["$lte"] = new Date(to);
      }

      let filter = {
        userId: id
      }

      if(from || to ) {
        filter.date = dateObj;
      }

      let nonNullLimit = limit ? limit : 500
      exercise.find(filter).limit(+nonNullLimit).exec((err, data)=>{
        if(err || !data){
          console.error(err);
          res.json({error: "error"})
        } 
        else {
          const count = data.length;
          const rawLog = data
          const {username, _id}= userData
          const log = rawLog.map((l) => ({
            description: l.description,
            duration: parseInt(l.duration),
            date: l.date.toDateString()
          }))
          res.json({username, count, _id,log})
        }
      })

    }
  })
})

*/

app.get("/api/users/:_id/logs", async (req, res) => {

  const theId = req.params._id;
  const theLimit = Number(req.query.limit) || 0;
  const theFrom = req.query.from || new Date(0);
  const theTo = req.query.to || new Date(Date.now());
  
  let theUser = await users.findById(theId).exec();
  let userLog = await exercise.find({ 
    userid: theId, 
    date: { $gte: theFrom , $lte: theTo } })
    .select("-_id -userid -__v")
    .limit(theLimit)
    .exec();

  //console.log(userLog.userid);
  //console.log(theId);

  // This is to convert the date to a string for each date in the array
  const newLog = userLog.map(each => {
    return {
      description: each.description,
      duration: each.duration,
      date: new Date(each.date).toDateString()
    }
  })

  //console.log(newLog);

  res.json({
    _id: theUser._id,
    username: theUser.username,
    count: userLog.length,
    log: newLog
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
