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
    try {
        filtered = filter.replaceWords("" + msg + " ", msg.substr(0, 1) + "*".repeat(msg.length - 1));
    } catch (e) {
        filtered = msg;
    }
    return filtered;
}

io.on('connection', function(socket) {
    //Chat Message
    socket.on('chat message', function(msg) {

        out = JSON.parse(msg);

        out.username = filterWords(out.username);
        out.text = filterWords(out.text);

        console.log("[" + out.time + "] " + "[" + out.hash + "]: " + out.username.substr(0, out.username.length - 1) + "; " + out.text);

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        currentUserList[out.hash][out.uuid] = out.username;
        filtered = JSON.stringify(out);

        io.emit('chat message', filtered);
    });

    //Add User to system
    socket.on('add User', function(name) {

        out = JSON.parse(name);

        out.username = filterWords(out.username);

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        currentUserList[out.hash][out.uuid] = out.username;

        filtered = JSON.stringify(out);

        io.emit('user connect', filtered);

    });

    //Remove User from system
    socket.on('remove User', function(name) {
        out = JSON.parse(name);

        out.username = filterWords(out.username);

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        delete currentUserList[out.hash][out.uuid];
        filtered = JSON.stringify(out);

        io.emit('user dc', filtered);
    });
});

function clearEmpty(list) {
    keys = Object.keys(list);

    for (x in keys) {
        if (x.length == 0) {
            delete x;
        }
    }
}
setInterval(() => {
    io.emit('userlist', currentUserList);
    clearEmpty(currentUserList);
}, 1000);

http.listen(port, function() {
    console.log('listening on *:' + port);
});