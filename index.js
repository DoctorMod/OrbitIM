const { disconnect } = require('process');
var BadLanguageFilter = require('bad-language-filter');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var favicon = require('serve-favicon');
var filter = new BadLanguageFilter();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/hidden', function(req, res) {
    res.sendFile(__dirname + '/hidden.html');
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + '/style.css');
});
app.get('/hidden.css', function(req, res) {
    res.sendFile(__dirname + '/hidden.css');
});
app.get('/google.png', function(req, res) {
    res.sendFile(__dirname + '/google.png');
});
app.use(favicon(__dirname + '/favicon.ico'));

let currentUserList = {};

function filterWords(msg) {
    try {
        filtered = filter.replaceWords(msg + " ", "****");
    } catch (e) {
        filtered = msg;
    }
    return filtered;
}



var passcode = '&wL.>C7*b3A&?=[4RDZCUm6]C];PA5+d,d2X?_78PA\\YT2\\,*LX3(=7gM#q"98!PwLmCrh\\kh$^+&6c?5~-7u&G\\X.$FcNKCQsg9Y*38Dc+MB;GzHM+J%;K}!Y>vgB[^"<E:RT)?fBw!-}<{-kKq+$g}M~>Z}D=h9\\8L6M6wu`r?"M!,Ej32}_Srjdf"L8L5vx:yU-mA~*aE6CYL%-VYM!RqLGD-"c;.6PcrKAYLv^^$xU:!zLk2GV$evd8!9[%Z';

var webdevencrypt = {
    encryptCodes: function(content) {
        var result = [];
        var passLen = passcode.length;
        for (var i = 0; i < content.length; i++) {
            var passOffset = i % passLen;
            var calAscii = (content.charCodeAt(i) + passcode.charCodeAt(passOffset));
            result.push(calAscii);
        }
        return JSON.stringify(result);
    },
    decryptCodes: function(content) {
        var result = [];
        var str = '';
        var codesArr = JSON.parse(content);
        var passLen = passcode.length;
        for (var i = 0; i < codesArr.length; i++) {
            var passOffset = i % passLen;
            var calAscii = (codesArr[i] - passcode.charCodeAt(passOffset));
            result.push(calAscii);
        }
        for (var i = 0; i < result.length; i++) {
            var ch = String.fromCharCode(result[i]);
            str += ch;
        }
        return str;
    }
}



io.on('connection', function(socket) {
    //Chat Message
    socket.on('chat message', function(encrypted) {

        msg = webdevencrypt.decryptCodes(encrypted);

        out = JSON.parse(msg);

        console.log("[" + out.time + "] " + "[" + out.hash + "]: " + out.username + "; " + out.text);

        out.username = filterWords(out.username);
        out.text = filterWords(out.text);

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        currentUserList[out.hash][out.uuid] = out.username;
        filtered = JSON.stringify(out);

        sendable = webdevencrypt.encryptCodes(filtered);

        io.emit('chat message', sendable);
    });

    //Add User to system
    socket.on('add User', function(encrypted) {
        name = webdevencrypt.decryptCodes(encrypted);
        out = JSON.parse(name);

        out.username = filterWords(out.username);

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        currentUserList[out.hash][out.uuid] = out.username;

        filtered = JSON.stringify(out);

        sendable = webdevencrypt.encryptCodes(filtered);

        io.emit('user connect', sendable);

    });

    //Remove User from system
    socket.on('remove User', function(encrypted) {
        name = webdevencrypt.decryptCodes(encrypted);

        out = JSON.parse(name);

        let keys = Object.keys(currentUserList);

        keys.forEach(item => {
            delete currentUserList[item][out.uuid];
        });

        currentUserList[out.hash] = currentUserList[out.hash] || {};
        filtered = JSON.stringify(out);

        sendable = webdevencrypt.encryptCodes(filtered);

        io.emit('user dc', sendable);
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
    encrypted = webdevencrypt.encryptCodes(JSON.stringify(currentUserList));
    io.emit('userlist', encrypted);
    clearEmpty(currentUserList);
}, 1000);

http.listen(port, function() {
    console.log('listening on *:' + port);
});