const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(http);

const { gameLoop, getUpdatedVelocity, initGame } = require("./game");
const { FRAME_RATE } = require("./constants");

const static_path = path.join(__dirname, "/public");

app.use(express.static(static_path));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

http.listen(port, () => {
    console.log("server listening to :", port);
});

// socket part

let state = {};
let connectionRoom = {};

const {User} = require('./utils/users');
const { isRealString } = require("./utils/isRealString");
const { stat } = require('fs');

let users = new User();

io.on('connection', (connection) => {
    console.log("A new user connected");

    // a new game state created

    connection.on("join", (params, callBack) => {
        if(!isRealString(params.displayName) || !isRealString(params.roomName))
        {
            callBack("Input Fields are Invalid");
        }
        else if(users.getUserList(params.roomName).length >= 2)
        {
            callBack("Maximum player limit reached");
        }
        else{
            roomName = params.roomName;
            connection.join(params.roomName);

            users.removeUser(connection.id);

            users.addUser(connection.id, params.displayName, params.roomName);
            connectionRoom[connection.id] = params.roomName;

            io.to(params.roomName).emit('updateUserList', users.getUserList(params.roomName));

            callBack();
            if(!state[params.roomName])
                state[params.roomName] = initGame();
            
            if(users.getUserList(params.roomName).length >= 2){
                state[params.roomName].gameOver = false;
                startGameIntervals(params.roomName);
            }
        }
    });

    connection.on('keydown', handleKeyDown);

    function handleKeyDown(keyCode, playerNumber, roomName)
    {
        try{
            keyCode = parseInt(keyCode);
            playerNumber = parseInt(playerNumber);
        }
        catch(e)
        {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if(vel){
            if(playerNumber==1){
                state[roomName].playerOne.vel = vel;
                console.log(state[roomName].playerOne.vel);
            }
            else if(playerNumber==2)    state[roomName].playerTwo.vel = vel;
        }
    }

    connection.on('disconnect', () => {
        console.log("user disconnected");
        users.removeUser(connection.id);
        
        state[connectionRoom[connection.id]] = null;
        io.to(connectionRoom[connection.id]).emit("gameState", initGame());
    });
});

function startGameIntervals(roomName)
{
    setTimeout(() => {
        const intervalId = setInterval(()=>{
            const winner = gameLoop(state[roomName]);
            console.log(winner);
    
            if(!winner)
            {
                io.to(roomName).emit('gameState', JSON.stringify(state[roomName]));
            }
            else if(winner === 100)
            {
                io.to(roomName).emit('eatFood');
            }
            else{
                state[roomName].gameOver = true;
                io.to(roomName).emit('gameOver', winner);

                // saayad state update nhi ho pa rhi thi
                state[roomName] = null;
                clearInterval(intervalId);
            }
    
        }, 1000/FRAME_RATE);
    }, 3000);
}