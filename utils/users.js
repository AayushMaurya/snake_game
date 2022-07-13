class User {
    constructor(){
        this.players = [];
    }

    addUser(id, name, room)
    {
        let user = {id, name, room};
        this.players.push(user);
        return user;
    }

    getUserList(room)
    {
        let users = this.players.filter((user) => user.room === room);

        let nameArray = users.map((user) => user.name);

        return nameArray;
    }

    getUser(id)
    {
        let userList = this.players.filter((user) => user.id === id);

        return userList[0];
    }

    removeUser(id)
    {
        let user = this.getUser(id);

        if(user)
        {
            this.players = this.players.filter((user) => user.id !== id);
        }

        return user;
    }
}

module.exports = {User};