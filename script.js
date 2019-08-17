var pubnub;
var checkup = [];
var purify;
document.getElementById('purify').value = "on";
document.getElementById('purify').checked = "true";
$(document).ready(function() {
  // Initialize the PubNub API connection.
  pubnub = PUBNUB.init({
    publish_key: 'pub-c-b6140a7a-583f-4085-aaa6-49fe56da1533',
    subscribe_key: 'sub-c-e38a37dc-ad26-11e9-a87a-b2acb6d6da6e'
  });

  // Grab references for all of our elements.
  var messageContent = $('#messageContent'),
    sendMessageButton = $('#sendMessageButton'),
    memberList = $('#memberList'),
    messageList = $('#messageList');
  var users = [];
  // Handles all the messages coming in from pubnub.subscribe.
  function handleMessage(message) {
    var classVal = -1;
    if (purify == true) {
      var messageText = DOMPurify.sanitize(message.text, {
        ALLOWED_TAGS: ['b', 'i', 'strong'],
        ALLOWED_ATTR: ['style']
      });
    } else {
      var messageText = message.text;
    }

    for (var i = 0; i < users.length; i++) {
      if (users[i] == message.username) {
        classVal = i + 1;
      }
    }

    if (classVal == -1) {
      users.push(message.username);
      classVal = users.length;
    }
    var messageEl = $("<li class='message " + classVal + "'>" +
      "<span class='username'>" + message.username + ": </span>" +
      "<span>" + message.time + "</span>" +
      messageText +
      "</li>");
    messageList.append(messageEl);
    // Scroll to bottom of page
    $("html, body").animate({
      scrollTop: $(document).height() - $(window).height()
    }, 'slow');
  };

  function SendRecieve(message) {
    console.log(message);
    if (message.send == "true" && !checkup.includes(message.username)) {
      checkup.push(message.username);
      memberList.innerHTML = "";
      pubnub.publish({
        channel: 'membersCheck',
        message: {
          username: $('#Username').val(),
          send: "false"
        }
      });
    } else {
      var memberEl = $("<li class='User'>" + message.username + "</li>");
      memberList.append(memberEl);
    }
  };

  // Compose and send a message when the user clicks our send message button.
  sendMessageButton.click(function(event) {
    var message = messageContent.val();
    var time = new Date();
    if (message != '') {
      pubnub.publish({
        channel: 'chat',
        message: {
          username: $('#Username').val(),
          text: message,
          time: time.getHours() + ":" + time.getSeconds() + ":" + time.getMinutes()
        }
      });

      messageContent.val("");
    }
    localStorage.username = $('#Username').val();
  });

  // Also send a message when the user hits the enter button in the text area.
  messageContent.bind('keydown', function(event) {
    if ((event.keyCode || event.charCode) !== 13) return true;
    sendMessageButton.click();
    return false;
  });

  // Subscribe to messages coming in from the channel.
  pubnub.subscribe({
    channel: 'chat',
    message: handleMessage
  });

  pubnub.subscribe({
    channel: 'membersCheck',
    message: SendRecieve
  });

  pubnub.publish({
    channel: 'chat',
    message: {
      username: $('#Username').val(),
      text: "has joined the channel"
    }
  });

  pubnub.publish({
    channel: 'membersCheck',
    message: {
      username: $('#Username').val(),
      send: "true"
    }
  });
});
if (localStorage.username == undefined) {
  localStorage.username = "user" + Math.floor(Math.random() * 100);
}
document.getElementById('Username').value = localStorage.username;

function reset() {
  document.getElementById('messageList').innerHTML = '';
}

window.onbeforeunload = function() {
  pubnub.publish({
    channel: 'chat',
    message: {
      username: $('#Username').val(),
      text: "has left the channel"
    }
  });
}
repeat()

function repeat() {
  /*
  pubnub.publish({
    channel: 'membersCheck',
    message: {
      username: $('#Username').val(),
      send: "true"
    }
  });*/
  purify = document.getElementById('purify').checked;
  setTimeout(repeat, 100);
}