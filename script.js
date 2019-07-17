function sendmsg(input) {
  CreateMessage(document.getElementById('input').value, "you");
  localStorage.send = document.getElementById('input').value;
  latest = document.getElementById('input').value;
  document.getElementById('input').value = "";
}

localStorage.send = '';
var latest = '';

document.getElementById('sendbox').addEventListener("submit", sendmsg);

function CreateMessage(message, request) {

  if (request == "you") {
    var icon = document.createElement("i");
    icon.classList.add("fas", "fa-user", "Left", "Icon");
    var bubble = document.createElement("div");
    bubble.classList.add("Bubble", "White");
    bubble.innerHTML = '<p class="you">' + message + '</p>';
    var divider = document.createElement("div");
    divider.classList.add("divider");
    document.getElementById('main').appendChild(icon);
    document.getElementById('main').appendChild(bubble);
    document.getElementById('main').appendChild(divider);
  } else if (request == "them") {
    var icon = document.createElement("i");
    icon.classList.add("fas", "fa-user", "Right", "Icon");
    var bubble = document.createElement("div");
    bubble.classList.add("Bubble", "Blue");
    bubble.innerHTML = '<p class="them">' + message + '</p>';
    var divider = document.createElement("div");
    divider.classList.add("divider");
    document.getElementById('main').appendChild(icon);
    document.getElementById('main').appendChild(bubble);
    document.getElementById('main').appendChild(divider);
  } else {
    console.error("request is set to an incorrect value.");
  }
}

repeat();

function repeat() {
  if (latest != localStorage.send) {
    CreateMessage(localStorage.send, "them");
    latest = localStorage.send;
  }
  setTimeout(repeat, 100);
}