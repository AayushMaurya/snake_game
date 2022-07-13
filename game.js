const { GRID_SIZE } = require("./constants");

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity
}

function initGame(){
    const state = createGameState();
    randomFood(state);

    return state;
}

function createGameState() {
    return {
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
}

function gameLoop(state) {
    if(!state){
        return;
    }
    
    const playerOne = state.playerOne;
    const playerTwo = state.playerTwo;

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if(playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE)
    {
        return 2;
    }
    if(playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE)
    {
        return 1;
    }

    // check for player one won
    for(cell of playerOne.snake)
    {
        if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y)
            continue;
        if(cell.x === playerTwo.pos.x && cell.y===playerTwo.pos.y){
            return 1;
        }
    }

    // check for player two win
    for(cell of playerTwo.snake)
    {
        if(cell.x===playerTwo.pos.x && cell.y===playerTwo.pos.y)
            continue;
        if(cell.x===playerOne.pos.x && cell.y===playerOne.pos.y){
            return 2;
        }
    }

    // check for tie
    if(playerOne.pos.x === playerTwo.pos.x && playerOne.pos.y===playerTwo.pos.y)
        return -1;

    // if playerOne eats food
    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y)
    {
        playerOne.snake.push({
            ...playerOne.pos
        });

        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;

        randomFood(state);

        return 100;
    }

    // if playerTwo eats food
    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y)
    {
        playerTwo.snake.push({
            ...playerTwo.pos
        });

        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;

        randomFood(state);

        return 100;
    }
    // 100 means some food has been eaten
    // move snake body of playerOne
    if(playerOne.vel.x || playerOne.vel.y)
    {
        // for(let cell of playerOne.snake)
        // {
        //     if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y)
        //     {
        //         console.log("6");
        //         return 2;
        //     }
        // }

        playerOne.snake.push({...playerOne.pos});
        playerOne.snake.shift();

    }

    // move body of playerTwo
    if(playerTwo.vel.x || playerTwo.vel.y)
    {
        // for checking if player touches its own body
        // for(let cell of playerTwo.snake)
        // {
        //     if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y)
        //     {
        //         console.log("7");
        //         return 1;
        //     }
        // }

        playerTwo.snake.push({...playerTwo.pos});
        playerTwo.snake.shift();

    }

    return false;
}

function randomFood(state){
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    }

    for(let cell of state.playerOne.snake)
    {
        if(cell.x === food.x && cell.y === food.y)
            return randomFood(state);
    }
    
    for(let cell of state.playerTwo.snake)
    {
        if(cell.x === food.x && cell.y === food.y)
            return randomFood(state);
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode) {
    switch(keyCode)
    {
        case 37: 
            return {x: -1, y: 0};
        case 38:
            return {x: 0, y: -1};
        case 39:
            return {x:1, y:0};
        case 40:
            return {x:0, y:1};
    }
}