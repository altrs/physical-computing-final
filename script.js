import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 480;

// var serial;
// var outByte = '';

// function setup() {
//   createCanvas(320, 260);  
//   serial = new p5.SerialPort();
//   serial.open('/dev/tty.usbmodem101');
//   serial.on('connected', serverConnected);
//   serial.on('list', gotList);
//   serial.on('data', gotData);
//   serial.on('error', gotError);
//   serial.on('open', gotOpen);
//   serial.on('close', gotClose);
// }

// function gotList(thelist) {
//  print("List of Serial Ports:");

//  for (let i = 0; i < thelist.length; i++) {
//   print(i + " " + thelist[i]);
//  }
// }

// function gotClose(){
//  print("Serial Port is Closed");
//  latestData = "Serial Port is Closed";
// }

// function gotOpen() {print("Serial Port is Open");}
// function gotError(theerror) {print(theerror);}
// function serverConnected() {print("Connected to Server");}


// function gotData() {
//  let currentString = serial.readLine();
//   trim(currentString);
//  if (!currentString) return;
//  console.log(currentString);
//  latestData = currentString;
// }

// function myFunction(){
//       outByte = 'O';
//       serial.write(outByte);
//       console.log(outByte);
//     }

//CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER
//CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER CREATE LANDMARKER
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
}
createFaceLandmarker();

//VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE
//VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE VIDEO CAPTURE
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
}else {console.warn("getUserMedia() is not supported by your browser");}

function enableCam(event) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  const constraints = {video: true};

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

//EYE DETECTION VIA FACE LANDMARKER EYE DETECTION VIA FACE LANDMARKER
//EYE DETECTION VIA FACE LANDMARKER EYE DETECTION VIA FACE LANDMARKER
 
let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }

  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
  }
  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
} 

// function drawBlendShapes(el, blendShapes) {
//   if (!blendShapes || blendShapes.length < 1) {return;}

//   let data = blendShapes[0];
//   let categoryName9 = data.categories[9].categoryName;
//   let categoryName10 = data.categories[10].categoryName;
//   let score9 = data.categories[9].score;
//   let score10 = data.categories[10].score;

//   // console.log(categoryName9 + score9);
//   // console.log(categoryName10 + score10);

//   if(serial && serial.isOpen()){
//     if(score9 > 0.5 && score10 > 0.5){
//       console.log("EYES CLOSED");
//       outByte = 'C';
//       serial.write(outByte);
//       document.body.style.backgroundColor = "green";
//     }else{
//       console.log("EYES OPEN");
//       outByte = 'O';
//       serial.write(outByte);
//       document.body.style.backgroundColor = "white";
//     }
//   }
// }
