import React from 'react';
import './App.css';

import { useState, useEffect } from "react";
import { initialize } from 'workbox-google-analytics';

function App() {
//   const [audioContext, setAudioContext] = useState(new window.AudioContext());
//   const [analyser, setAnalyser] = useState(audioContext.createAnalyser());
//   const [microphone, setMicrophone] = useState(0); 
//   const [frequency, setFrequency] = useState(0);
//   const [myNote, setMyNote] = useState(0);

  

//   function beginRecording(){
//     console.log( audioContext.sampleRate);
    

//     checkAudio();

//     setInterval(checkAudio, 100);
//   }

//   function checkAudio(){
//     analyser.fftSize = 32768;
//     var bufferLength = analyser.fftSize;
//     var freqBinDataArray = new Uint8Array(bufferLength);
//     analyser.getByteFrequencyData(freqBinDataArray);
//     var index = getIndexOfMax(freqBinDataArray)
//     setFrequency((index)*((audioContext.sampleRate/2)/ analyser.fftSize))

//     //setTimeout(checkAudio, 100);
//   }

//   function getIndexOfMax(array) {
//     return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
//   }

//   function calculateNote(frequency){
//     var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
//     var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
//     var note = Math.round( noteNum ) + 69;
//     return noteStrings[note%12]
// }


//   useEffect( ()=>{
//     if(microphone != 0){
//       microphone.connect(analyser);
//       beginRecording();
//     }
//   },[microphone])

//   useEffect( ()=>{
//     setMyNote(calculateNote(frequency))
//   },[frequency])

//   useEffect( ()=>{
//     if (navigator.mediaDevices.getUserMedia){
//       console.log("Success");
//       var constraints = { audio: true };
  
//       navigator.mediaDevices.getUserMedia(constraints)
//               .then(function(stream) {
//                   setMicrophone(audioContext.createMediaStreamSource(stream));
//               })
//               .catch(function(err) {
//                   console.error('error: ' + err);
//               })
//     }
//   },[audioContext])

const [frequency, setFrequency] = useState(0);
const [myNote, setMyNote] = useState(0);

function init(){
  console.log("Started")
  var audioContext = new(window.AudioContext || window.webkitAudioContext)();
  var microphone;

  var analyser = audioContext.createAnalyser();

    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
        var constraints = { audio: true }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                beginRecording();
            })
            .catch(function(err) {
                console.error('error: ' + err);
            })
    } else {
        console.error('getUserMedia unsupported by browser');
    }

    function beginRecording() {
      console.log( audioContext.sampleRate);
      analyser.fftSize = 32768; // power of 2, between 32 and max unsigned integer
      var bufferLength = analyser.fftSize;
      var float32 = new Float32Array(analyser.fftSize);


      var freqBinDataArray = new Uint8Array(bufferLength);

      var checkAudio = function() {
          analyser.getByteFrequencyData(freqBinDataArray);
          analyser.getFloatFrequencyData(float32);
          var index = getIndexOfMax(freqBinDataArray)

          var frequency =  ((index)*((audioContext.sampleRate/2)/ analyser.fftSize))
          setFrequency(frequency);
          console.log(frequency)
          setMyNote(calculateNote(frequency))
      }

      setInterval(checkAudio, 64);
  }


}

function getIndexOfMax(array) {
  return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

function calculateNote(frequency){
  var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  var note = Math.round( noteNum ) + 69;
  return noteStrings[note%12]
}


  return (
    <div className="App">
     <h1>{myNote}</h1>
     <h1>{frequency} Hz</h1>
     <button onClick={init}>Start</button>
    </div>
  );
}

export default App;
