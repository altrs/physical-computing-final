<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Eye Detector</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <html>
  <head>

    <meta charset="utf-8">
    <meta http-equiv="Cache-control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title>Eye Detector</title>

    <script src="https://cdn.jsdelivr.net/npm/p5@1.8.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@latest/lib/p5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@latest/lib/addons/p5.dom.min.js"></script>
    <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
    <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>

    <script language="javascript" type="text/javascript" src="https://cdn.jsdelivr.net/npm/p5.serialserver@0.0.28/lib/p5.serialport.js"></script>

  </head>
  <body>

    <div id="liveView" class="videoView">
      <!-- BUTTON -->
      <button id="webcamButton" class="mdc-button mdc-button--raised">
        <span class="mdc-button__ripple"></span>
        <span class="mdc-button__label">ENABLE WEBCAM</span>
      </button>
      <!-- CAMERA OUTPUT -->
      <div style="position: relative;">
        <video id="webcam" style="position: abso" autoplay playsinline></video>
        <canvas class="output_canvas" id="output_canvas" style="position: absolute; left: 0px; top: 0px;"></canvas>
      </div>
    </div>

    <audio id="intro" src="audio/first.wav"></audio>
    <audio id="repeat" src="audio/repeat.wav"></audio>

    <!-- LANDMARKERS -->
    <div class="blend-shapes">
      <ul class="blend-shapes-list" id="video-blend-shapes"></ul>
    </div>

    <button onclick="myFunction()">Click me</button>

  </body>
  
  <script type="module" src="script.js"></script>
  <script type="text/javascript">
    
    let serial;
    let outByte = '';
    let data;
    let categoryName3;
    let categoryName9;
    let categoryName10;
    let score3;
    let score9;
    let score10;
    let running = false;

    const audio = document.getElementById("intro");

    function setup() {
      createCanvas(320, 260);  
      serial = new p5.SerialPort();
      serial.open('/dev/tty.usbmodem101');
      serial.on('connected', serverConnected);
      serial.on('list', gotList);
      serial.on('data', gotData);
      serial.on('error', gotError);
      serial.on('open', gotOpen);
      serial.on('close', gotClose);
    }

    function gotList(thelist) {
     print("List of Serial Ports:");
     for (let i = 0; i < thelist.length; i++) {print(i + " " + thelist[i]);}
    }

    function gotClose(){
     print("Serial Port is Closed");
     latestData = "Serial Port is Closed";
    }

    function gotData() {
     let currentString = serial.readLine();
      trim(currentString);
     if (!currentString) return;
     console.log(currentString);
     latestData = currentString;
    }

    function myFunction(){
      outByte = 'O';
      serial.write(outByte);
      console.log(outByte);
    }

    function gotOpen() {print("Serial Port is Open");}
    function gotError(theerror) {print(theerror);}
    function serverConnected() {print("Connected to Server");}

    //MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN
    //MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN

    function drawBlendShapes(el, blendShapes) {
      if (!blendShapes || blendShapes.length < 1) {
        outByte = 'X';
        serial.write(outByte);
        console.log(outByte);
        document.body.style.backgroundColor = "black";
        if(running == true){
          console.log("HUMAN REMOVED");
          audio.pause();
          repeat.pause();
          audio.currentTime = 0;
          repeat.currentTime = 0;
          reset();
          running = false;
        }
        return;
      }else{run();}

      data = blendShapes[0];
      categoryName3 = data.categories[3].categoryName;
      categoryName9 = data.categories[9].categoryName;
      categoryName10 = data.categories[10].categoryName;
      score3 = data.categories[3].score;
      score9 = data.categories[9].score;
      score10 = data.categories[10].score;

      // eyeState();

      }


      function eyeState(){
        console.log("EYE STATE");

        document.addEventListener('keydown', function (event) {
          if (event && event.key.toLowerCase() === 'x') {
            outByte = 'C';
            serial.write(outByte);
            console.log("X OVERRIDE");
            document.body.style.backgroundColor = "green";
            return 'C';
          }
        });

        if(score9 > 0.5 && score10 > 0.5){
          outByte = 'C';
          serial.write(outByte);
          // console.log(outByte);
          document.body.style.backgroundColor = "green";
          return 'C';
        }else{
          outByte = 'O';
          serial.write(outByte);
          // console.log(outByte);
          document.body.style.backgroundColor = "white";
          return 'O';
        }
      }

      let consecutiveCCount = 0;

      function run(){
        document.body.style.backgroundColor = "white";
        console.log("RUNNING");
        running = true;
        audio.play();
        
        console.log(audio.currentTime);
        if(audio.currentTime > 11){ //announcement finished
          console.log("ANNOUNCMENT FIN");
          audio.pause();
          repeat.loop = true;
          repeat.play();
          eyeState(); //begin eye detector
          let eyeResult = eyeState();
          console.log('EYERESULT: ' + eyeResult);

          let initial_close = setInterval(function () {
            // let eyeResult = eyeState();
            if (eyeResult === 'C') {consecutiveCCount++;}
            else {consecutiveCCount = 0;}
          }, 100);

          if (consecutiveCCount >= 2000 / 100) { //greater than or equal to 20
            console.log("Eye state has been 'C' for 2 seconds straight.");
            run2();
          } else {console.log("Eye state is not 'C' for 2 seconds straight yet.");}
        }
      }

      function run2(){
        console.log("RUN2");
        repeat.pause();
        repeat.currentTime = 0;
        audio.play();
      }

      // repeat.pause();
      // repeat.currentTime = 0;
      // clearInterval(initial_close);
      // if eyes open, audio.pause
      // else audio.play();

      // if(currentTime > 48) //poem intro finished
      //send '1' to arduino, and arduino enters state 1 : opens curtains, enables eye check. Runs if eyes closed, stops if eyes open
      // in arduino, if serial.read == 1, eyes close eyes open function running

      // if(currentTime > 03:10)
      // send arduino '2'
      // eyeState() checking results in a fizzled 'dont look', rotate stageFront

      // 

      function reset(){
        console.log("reset");
        //send R to arudino
        //reset audio
      }

    //  document.addEventListener('keydown', function(event) {
    //   if (event.key.toLowerCase() === 'x') {
    //     // console.log("X");
    //     eyeResult = 'C'; // Override eyeResult to equal 'C'
    //   }
    // });

  </script>
</body>
</html>