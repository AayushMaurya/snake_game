const BG_colour = '#231f20';
const SNAKE_COLOUR1 = '#c2c2c2';
const SNAKE_COLOUR2 = '#c3c3c3'
const FOOD_COLOUR = '#e66916';
const FACE_COLOUR1 = '#0000FF';
const FACE_COLOUR2 = '#00FFFF';
const gameScreen = document.getElementById('gameScreen');
let roomName = null;
let playerName = null;
let playerNumber = null;
let players = ["Player1", "Player2"];


const ws = io();

ws.on('connect', ()=>{
    console.log("connected");

    let substr = window.location.search.substring(1);
    let paras = JSON.parse('{"' + decodeURI(substr).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

    roomName = paras.roomName;
    playerName = paras.displayName;

    ws.emit("join", paras, function(err){
        if(err)
        {
            alert(err);
            window.location.href = "/";
        }
        else
            console.log("successfully joined");
    });

});

ws.on('gameState', handleGameState);
ws.on('gameOver', handleGameOver);
ws.on('updateUserList', handleUpdateUserList);

let canvas, ctx;

let gameState = {
    gameOver: true,
    playerOne: {
        pos: {
            x: 4,
            y: 5
        },
        vel: {
            x: 1,
            y: 0
        },
        snake: [
            {x: 1, y: 5},
            {x: 2, y: 5},
            {x: 3, y: 5},
        ],
    },
    playerTwo: {
        pos: {
            x: 33,
            y: 35
        },
        vel: {
            x: -1,
            y: 0
        },
        snake: [
            {x: 34, y: 35},
            {x: 35, y: 35},
            {x: 36, y: 35},
        ],
    },
    food: {
        x: 20,
        y: 20,
    },
    gridsize: 40,
};

init = () => {
    canvas = document.getElementById('canvas');
    // The HTMLCanvasElement.getContext() method returns a drawing context on the canvas
    // 2d states that we are going to dray 2d object on canvas
    ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 520;

    ctx.fillStyle = BG_colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
}

keydown = (e) =>{
    console.log(e.keyCode);
    ws.emit('keydown', e.keyCode, playerNumber, roomName);
}

// paint the canvas

function paintGame(state) {
    ctx.fillStyle = BG_colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const sizex = canvas.width / gridsize;
    const sizey = canvas.height / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * sizex, food.y * sizey, sizex, sizey);

    paintPlayer(state.playerOne, sizex, sizey, SNAKE_COLOUR1);
    paintPlayer(state.playerTwo, sizex, sizey, SNAKE_COLOUR2);

    paintPlayerFace(state.playerOne, sizex, sizey, FACE_COLOUR1);
    paintPlayerFace(state.playerTwo, sizex, sizey, FACE_COLOUR2);
}

function paintPlayerFace(playerState, sizex, sizey, colour)
{
    ctx.fillStyle = colour;
    ctx.fillRect(playerState.pos.x*sizex, playerState.pos.y*sizey, sizex, sizey);
}

function paintPlayer(playerState, sizex, sizey, colour)
{
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for(let cell of snake) {
        ctx.fillRect(cell.x*sizex, cell.y*sizey, sizex, sizey);
    }
}

init();
paintGame(gameState);

function handleGameState(message) {
    // console.log(message);
    gameState = JSON.parse(message);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(winner){
    winner = parseInt(winner);
    ws.disconnect();
    if(winner == playerNumber){
        if(confirm("you won") == true)
            window.location.reload();
        else   
            window.location.href = "/";
    }
    else if(winner == -1){
        if(confirm("Tie")==true)
            window.location.reload();
        else
            window.location.href = "/";
    }
    else{
        if(confirm("you loose")==true)
            window.location.reload();
        else
            window.location.href = "/";
    }
}

function handleUpdateUserList(userList){

    players[0] = userList[0];
    if(userList.length == 2)
        players[1] = userList[1];
    else
        players[1] = "player2";
    if(playerName === userList[0])
        playerNumber = 1;
    else
        playerNumber = 2;
    console.log(playerName, playerNumber);
    
    document.getElementById('playerOneName').innerHTML = players[0];
    document.getElementById('playerTwoName').innerHTML = players[1];
}
