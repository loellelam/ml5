let video;
let poseNet;
let poses = [];

function setup() {
    createCanvas(640, 480);
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
    // Display the image in the canvas
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse if the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);

                // Detect raising hand
                // If left or right wrist is above y = 375
                if (pose.keypoints[9].position.y < 375 || pose.keypoints[10].position.y < 375) {
                    select('#placeholder').html("Raising hand");
                }
                else {
                    select('#placeholder').html("Not raising hand");
                }
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        // For every skeleton, loop through all body connections
        let skeleton = poses[i].skeleton;
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 0, 0);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}