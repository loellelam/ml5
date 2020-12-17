let video;
let poseNet;
let poses = [];

// Stores position of nose keypoint
var keypointX;
var keypointY;

var cw = 640; //canvas width
var ch = 480; //canvas height

var target = new Target();

var begin = false; // set to true to begin game
var score = 0;
var gameEnded = false; // tracks if endGame() has executed

var executed = false; // ensure startTimer() only runs once
var timer; // interval timer
var timeLeft = 3; // remaining time in seconds

function setup() {
    let canvas = createCanvas(cw, ch);
    canvas.center();
    
    video = createCapture(VIDEO);
    video.size(width, height); // set webcam to be same dimensions as canvas

    // Create a new poseNet model, taking as input:
    // webcam feed and a callback func that runs when model sucessfully loads
    poseNet = ml5.poseNet(video, modelReady);

    // This sets up an event that fills the global array "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function(results) {
        poses = results;
    });

    // Hide the video element, and just show the canvas
    video.hide();
}

function modelReady() {
    select('#status').html('Model Loaded');
}

function draw() {
    // Display mirrored image in the canvas
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    drawKeypoints(); // draw nose keypoint

    if (timeLeft <= 0 && !gameEnded) { // ends game only once after time limit expires
        endGame();
    }

    if (begin && !executed) { // start timer only once after hitting enter key
        startTimer();
    }

    target.display();
    target.collide();
}

// A function to draw circles over the detected keypoints
function drawKeypoints()  {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw a circle if the pose probability is bigger than 0.2 and is the nose point
            if (keypoint == pose.keypoints[0] && keypoint.score > 0.2) {
                push();
                fill(255, 0, 0);
                noStroke();
                keypointX = keypoint.position.x;
                keypointY = keypoint.position.y;
                circle(keypointX, keypointY, 10);
                pop();
            }
        }
    }
}

function Target() {
    // Generate at a random position within the canvas
    this.x = (Math.random() * (cw - 60));
    this.y = (Math.random() * (ch - 60));

    // Dimensions of target
    this.width = 60;
    this.height = 60;

    // Display target
    this.display = function() {
        push();
        strokeWeight(5);
        if (begin && !gameEnded) {
            stroke(60, 183, 194);
        }
        else {
            stroke(0);
        }
        noFill();
        rect(this.x, this.y, this.width, this.height);
        pop();
    }

    // Detects when nose touches target
    this.collide = function() {
        collided = collideRectCircle(this.x, this.y, this.width, this.height, keypointX, keypointY, 10);
        if (timeLeft > 0 && begin && collided) {
            // Reset timer
            clearInterval(timer); // stop current timer
            timer = setInterval(countDown, 1000); // create new timer
            timeLeft = 3;
            select("#timer").html(timeLeft);

            this.x = (Math.random() * (cw - 60));
            this.y = (Math.random() * (ch - 60));
            score++;
            select('#score').html(score);
        }
    }
}

function keyPressed() {
    if (keyCode == 13) {
        begin = true;
    }
    if (keyCode == 82) { //r key
        restart();
    }
}

function startTimer() {
    executed = true;
    timer = setInterval(countDown, 1000); // count down every second
}

// Displays countdown in seconds
function countDown() {
    timeLeft--;
    select("#timer").html(timeLeft);
}

function endGame() {
    clearInterval(timer); // stop timer
    gameEnded = true; // game is no longer running
    select("#timer").html("Timed Out!");
}

function restart() { //using a function to prevent auto reload
    // Disable restart if game is running
    if (gameEnded) {
        // Reset all values
        begin = true;
        score = 0;
        select("#score").html(score);
        gameEnded = false;
        executed = false;
        timeLeft = 3;
        select("#timer").html(timeLeft);
    }
}