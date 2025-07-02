const express = require('express') // 

const mongoose = require('mongoose')

const Player =  require('./models/Player')
const Tournament = require('./models/Tournament')
const Match = require('./models/Match')

const app = express()
app.use(express.json()) //Use express JS

mongoose.connect('mongodb://127.0.0.1:27017/tournamentDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=> console.log('Connect to MongoDB successfully'))
.catch(err=> console.error('MongoDB error:',err));

// http://localhost:3000/register
app.post('/register',async(req,res) => 
{
    try{
        const {full_name, phone,ID, email,nick_name,tournament} = req.body;
        const newPlayer = new Player({ full_name,phone,ID,email,nick_name,tournament,status :'pending' });  
        await newPlayer.save();

        res.status(201).json({message: "Register Successfully!", player: newPlayer});
    }   catch(err) {
        res.status(500).json({error:'Error occured while creating registration ', details: err.message});
    }
});

const PORT = 3000;     
app.listen(PORT, ()=>  console.log(`Server chạy tại http://localhost:${PORT}`));
