// Create connection to Node.JS Server
const socket = io();

// Initialize variables

// HTML elements
let loginPage; // The login page // '.login.page'
let experiencePage; // The main experience //'.experience.page'

let canvas;
let gui;

//input DOM elements
let usernameInput; // Input for username // '.usernameInput'

// Prompt for setting a username
let username;
let connected = false;

//going to store which text field we listen to
let currentInput; // focus usernameInput fist
//global variables

// device motion
let accX = 0;
let accY = 0;
let accZ = 0;
let rrateX = 0;
let rrateY = 0;
let rrateZ = 0;

// device orientation
let rotateDegrees = 0;
let frontToBack = 0;
let leftToRight = 0;

let benSong;
let mishaSong;
let phasmaSong;


  
  


function setup() {
  

  benSong = loadSound('https://cdn.glitch.global/d3328b52-33ec-4f3a-9f1f-124e7f5d02e4/benSong.wav?v=1708268361517');
  mishaSong = loadSound('https://cdn.glitch.global/d3328b52-33ec-4f3a-9f1f-124e7f5d02e4/mishaSong.wav?v=1708284510560');
  phasmaSong = loadSound('https://cdn.glitch.global/d3328b52-33ec-4f3a-9f1f-124e7f5d02e4/phasma_sound.wav?v=1708282958484');
  canvas = createCanvas(displayWidth, displayHeight);
  canvas.parent("sketch-container");

  loginPage = select("#login");
  experiencePage = select("#sketch-container");

  gui = select("#gui-container");



  //username input
  usernameInput = createInput("");
  usernameInput.parent("#login-form");
  usernameInput.addClass("usernameInput");
  usernameInput.input(usernameInputEvent);

  //Chate message input

  //type="text" maxlength="14"

  rectMode(CENTER);
  angleMode(DEGREES);

  //----------
  //the bit between the two comment lines could be move to a three.js sketch except you'd need to create a button there
  if (
    typeof DeviceMotionEvent.requestPermission === "function" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    // iOS 13+
    askButton = createButton("Permission"); //p5 create button
    askButton.mousePressed(handlePermissionButtonPressed); //p5 listen to mousePressed event
    askButton.addClass("ask");
  } else {
    // if there is a device that doesn't require permission
    window.addEventListener("devicemotion", deviceMotionHandler, true);
    window.addEventListener("deviceorientation", deviceTurnedHandler, true);
  }
}

function draw() {
  background(0);

  let totalMovement = Math.abs(accX) + Math.abs(accY) + Math.abs(accZ); //movement in any direction
  //set your own threshold for how sensitive you want this to be
  if (totalMovement > 2 && username === "Ben") {
    background(random(255), random(255), random(255));
 

    for (let i = 0; i < 100; i++) {
      stroke(random(255), random(255), random(255));
      strokeWeight(random(5));
      if (random() > 0.5) {
        noFill();
        rect(random(width), random(height), random(width), random(height));
      } 
    }
  } else if (totalMovement > 2 && username === "Misha") {
      background(random(255), random(255), random(255));
      fill(255, 0, 0);

    for (let i = 0; i < 100; i++) {
      stroke(random(255), random(255), random(255));
      strokeWeight(random(5));
      if (random() > 0.5) {
        noFill();
        ellipse(random(width), random(height), random(width), random(height));
      }
    }
  } else if (totalMovement > 2 && username === "Phasma") {
    background(random(0, 255));
    fill(random(255), 0, 0);

    for (let i = 0; i < 100; i++) {
      stroke(random(255), random(255), random(255));
      strokeWeight(random(2));
      if (random() > 0.5) {
        stroke(random(255), 0, 0);
        line(random(width),0, random(width), random(height));
      } else {
        rect(random(width), random(height), random(50), random(50));
      }
    }
  }

  //Creating a tilt sensor mechanic that has a sort of boolean logic (on or off)
  //if the phone is rotated front/back/left/right we will get an arrow point in that direction
  push();
  translate(width / 2, height / 2);

  if (frontToBack > 40) {
    push();
    rotate(-180);
    triangle(-30, -40, 0, -100, 30, -40);
    benSong.rate(0.5);
    mishaSong.rate(0.5);
    phasmaSong.rate(0.5);
    pop();
   
   
  } else if (frontToBack < 0) {
    push();
    triangle(-30, -40, 0, -100, 30, -40);
    benSong.rate(2);
    mishaSong.rate(2);
    phasmaSong.rate(2);
    pop();
  }

  if (leftToRight > 20) {
    push();
    rotate(90);
    triangle(-30, -40, 0, -100, 30, -40);
    benSong.rate(1);
    mishaSong.rate(1);
    phasmaSong.rate(1);
    pop();
  } else if (leftToRight < -20) {
    push();
    rotate(-90);
    triangle(-30, -40, 0, -100, 30, -40);
    benSong.rate(1.5);
    mishaSong.rate(1.5);
    phasmaSong.rate(1.5);
    pop();
  }
  pop();

  //Debug text
  fill(0);
  textSize(15);

  text("acceleration: ", 10, 10);
  text(
    accX.toFixed(2) + ", " + accY.toFixed(2) + ", " + accZ.toFixed(2),
    10,
    40
  );

  text("rotation rate: ", 10, 80);
  text(
    rrateX.toFixed(2) + ", " + rrateY.toFixed(2) + ", " + rrateZ.toFixed(2),
    10,
    110
  );

  text("device orientation: ", 10, 150);
  text(
    rotateDegrees.toFixed(2) +
      ", " +
      leftToRight.toFixed(2) +
      ", " +
      frontToBack.toFixed(2),
    10,
    180
  );
}

// Sets the client's username
function setUsername() {
  username = cleanInput(usernameInput.value().trim());

  // If the username is valid
  if (username) {
    loginPage.addClass("hide");
    experiencePage.removeClass("hide");

    // $currentInput = $inputMessage.focus();

    // Tell the server your username
    socket.emit("add user", username);
  }
}

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)

// Prevents input from having injected markup
function cleanInput(input) {
  //remove all html tags, so no one can mess with your system
  let clean = input.replace(/(<([^>]+)>)/gi, "");
  return clean;
}

//Events we are listening for

function keyPressed() {
  if (keyCode === ENTER) {
    if (username) {
      sendMessage();
    } else {
      setUsername();
    }
  }
}

function usernameInputEvent() {
  console.log(this.value());
}

function chatInputEvent() {
  console.log(this.value());
}

function handleButtonPress() {
  gui.toggleClass("open");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Connect to Node.JS Server
// Socket events

// Whenever the server emits 'login', log the login message
socket.on("login", (data) => {
  connected = true;
  // Display the welcome message
  const message = "Welcome to Socket.IO Chat – ";
  addLogElement(message);
  addParticipantsMessage(data);
});

// Whenever the server emits 'new message', update the chat body
socket.on("new message", (data) => {
  addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on("user joined", (data) => {
  addLogElement(`${data.username} joined`);
  addParticipantsMessage(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on("user left", (data) => {
  addLogElement(`${data.username} left`);
  addParticipantsMessage(data);
});

socket.on("disconnect", () => {
  addLogElement("you have been disconnected");
});

socket.io.on("reconnect", () => {
  addLogElement("you have been reconnected");
  if (username) {
    socket.emit("add user", username);
  }
});

socket.io.on("reconnect_error", () => {
  addLogElement("attempt to reconnect has failed");
});

function handlePermissionButtonPressed() {
  DeviceMotionEvent.requestPermission().then((response) => {
    // alert(response);//quick way to debug response result on mobile, you get a mini pop-up
    if (response === "granted") {
      window.addEventListener("devicemotion", deviceMotionHandler, true);
    }
  });

  DeviceOrientationEvent.requestPermission()
    .then((response) => {
      if (response === "granted") {
        // alert(response);//quick way to debug response result on mobile, you get a mini pop-up
        window.addEventListener("deviceorientation", deviceTurnedHandler, true);
      }
    })
    .catch(console.error);
}

//AVERAGE YOUR DATA!!!
//Microphone input from last term....

// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event
function deviceMotionHandler(event) {
  accX = event.acceleration.x;
  accY = event.acceleration.y;
  accZ = event.acceleration.z;

  rrateZ = event.rotationRate.alpha; //alpha: rotation around z-axis
  rrateX = event.rotationRate.beta; //rotating about its X axis; that is, front to back
  rrateY = event.rotationRate.gamma; //rotating about its Y axis: left to right
}

//https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event
function deviceTurnedHandler(event) {
  //degrees 0 - 365
  rotateDegrees = event.alpha; // alpha: rotation around z-axis
  frontToBack = event.beta; // beta: front back motion
  leftToRight = event.gamma; // gamma: left to right
}

function mousePressed() {
  if (!benSong.isPlaying () && username === "Ben") {
    // .isPlaying() returns a boolean
    benSong.loop();
   
  }else if(!mishaSong.isPlaying () && username === "Misha"){
    mishaSong.loop();
  } else if(!phasmaSong.isPlaying () && username === "Phasma"){
    phasmaSong.loop();
  } else {
    phasmaSong.stop();
    benSong.stop();
    mishaSong.stop();
  
  }
}

