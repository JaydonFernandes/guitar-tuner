import React from 'react';
import './App.css';

import { useState, useEffect } from "react";

function App() {
  const [audioContext, setAudioContext] = useState(new window.AudioContext());
  const [analyser, setAnalyser] = useState(audioContext.createAnalyser());
  const [microphone, setMicrophone] = useState(0); 
  const [frequency, setFrequency] = useState(0);
  const [myNote, setMyNote] = useState(0);

  

  function beginRecording(){
    console.log( audioContext.sampleRate);
    

    checkAudio();

    setInterval(checkAudio, 100);
  }

  function checkAudio(){
    analyser.fftSize = 32768;
    var bufferLength = analyser.fftSize;
    var freqBinDataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(freqBinDataArray);
    var index = getIndexOfMax(freqBinDataArray)
    setFrequency((index)*((audioContext.sampleRate/2)/ analyser.fftSize))

    //setTimeout(checkAudio, 100);
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


  useEffect( ()=>{
    if(microphone != 0){
      microphone.connect(analyser);
      beginRecording();
    }
  },[microphone])

  useEffect( ()=>{
    setMyNote(calculateNote(frequency))
  },[frequency])

  useEffect( ()=>{
    if (navigator.mediaDevices.getUserMedia){
      console.log("Success");
      var constraints = { audio: true };
  
      navigator.mediaDevices.getUserMedia(constraints)
              .then(function(stream) {
                  setMicrophone(audioContext.createMediaStreamSource(stream));
              })
              .catch(function(err) {
                  console.error('error: ' + err);
              })
    }
  },[audioContext])


  return (
    <div className="App">
     <h1>{myNote}</h1>
     <h1>{frequency} Hz</h1>
    </div>
  );
}

export default App;
