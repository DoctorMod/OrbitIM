const { disconnect } = require('process');
var BadLanguageFilter = require('bad-language-filter');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var filter = new BadLanguageFilter();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

let currentUserList = {};

function filterWords(msg) {
    let filtered = filter.replaceWords("" + msg + " ", msg.substr(0,1)+"*".repeat(msg.length-1));
    return filtered;
}


io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        
        out = JSON.parse(msg);
        
        console.log("checkName")
        out.username = filterWords(out.username);
        console.log("checkMsg")
        out.text = filterWords(out.text);
        
        filtered = JSON.stringify(out);
        
        io.emit('chat message', filtered);
        message = JSON.parse(filtered);
        currentUserList[message.uuid] = message.username;
        //console.log(msg);
    });
    socket.on('user connect', function(name) {
        let filtered = filterWords(name[1]);
        
        let out = [name[0], filtered];
        
        io.emit('user connect', out);
        
        currentUserList[out[0]] = out[1];
        console.log("connect");
        console.log(currentUserList);
    });
    socket.on('user dc', function(name) {
        let filtered = filterWords(name[1]);
        let out = [name[0], filtered];
        io.emit('user dc', out);
        delete currentUserList[out[0]];
        console.log("dc")
        console.log(currentUserList);
    });
});

setInterval(() => {
    io.emit('userlist', currentUserList);
}, 1000);

http.listen(port, function() {
    console.log('listening on *:' + port);
});