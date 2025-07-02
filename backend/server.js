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
// test-case, add 8 người giải đấu T01 và  tạo bảng xong check collection match 2/7/2025
// http://localhost:3000/generate-matches
app.post('/generate-matches', async(req,res)=>{
    try {
        const {tournamentID,numberOfPlayers} = req.body;
        
        const players = await Player.find({tournament : tournamentID,status : 'pending'}).limit(numberOfPlayers);

        
        if(players.length < numberOfPlayers) {
            
            return res.status(400).json({message:"Không đủ người để tạo bảng đấu,"});
        }
        
        //SHUFFLED THE LIST
        const shuffled = players.map(p =>p.ID).sort(()=> Math.random()- 0.5); //Không hiểu nghĩa câu lệnh này cho lắm

        //MAKE PAIR
        const MatchList =[];
        for(let i = 0; i < shuffled.length; i+=2) {
            const newMatch = new Match ({
                player1:shuffled[i],
                player2:shuffled[i+1],
                tournament_ID: tournamentID
            });
            await newMatch.save(); //save vào đâu -> save vào collection matches
            MatchList.push(newMatch);
        }
        res.status(201).json({message:"Tạo bảng đấu thành công", matches:MatchList});
    }
    catch(error) {
        res.status(500).json({error:'Lỗi khi tạo bảng đấu',details: error.message});
    }
});
// http://localhost:3000/tournament
app.post('/tournament',async(req,res) => {
    try {
        const {tourID,tourName,startDate,endDate}  = req.body;
        const newTournament = new Tournament( {
            tour_ID : tourID,
            tourName: tourName,
            start_date :startDate,
            end_date : endDate
        })
        newTournament.save();
        res.status(201).json({message:"Tạo tournament thành công",tournament:newTournament});
    }
    catch(error) {
        res.status(500).json({error:'Lỗi khi tạo tournament', details: error.message});
    }
}
);
const PORT = 3000;     
app.listen(PORT, ()=>  console.log(`Server chạy tại http://localhost:${PORT}`));
