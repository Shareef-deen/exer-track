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
  } 
else if(date === "Invalid Date"){
        date = new Date().toDateString()

  }
  else {
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
        console.error(err);
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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
