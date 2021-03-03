import React from 'react';
import './App.css';

import { useState, useEffect } from "react";
import { initialize } from 'workbox-google-analytics';

import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import { green } from '@material-ui/core/colors';
import { blue } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress'


const useStyles = makeStyles((theme) => ({
  
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
    
  },
  fabProgress: {
    color: blue[500],
    position: 'absolute',
    top: -5,
    left: -5,
    zIndex: 1
  },
  disabledUntunedFab: {
    background: 'linear-gradient(#999999, #999999)',
  },
  disabledTunedFab: {
    background: 'linear-gradient(#4caf50, #4caf50)',
  }
}));

function App() {


  const classes = useStyles();

  const [frequency, setFrequency] = useState(0);
  const [myNote, setMyNote] = useState(0);
  const [audioContext, setAudioContext] = useState(0);
  const [analyser, setAnalyser] = useState(0);
  const [microphone, setMicrophone] = useState(0);

  const [e2Tuned, setE2Tuned] = useState(false);
  const [a2Tuned, setA2Tuned] = useState(false);
  const [d3Tuned, setD3Tuned] = useState(false);
  const [g3Tuned, setG3Tuned] = useState(false);
  const [b3Tuned, setB3Tuned] = useState(false);
  const [e4Tuned, setE4Tuned] = useState(false);

  const [targetNote, setTargetNote] = useState("E2");

  const [test, setTest] = useState(0);

  const [matchingNoteCount, setMatchingNoteCount] = useState(0);

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

useEffect( ()=>{
    if(test >0){

      analyser.fftSize = 32768;
      var bufferLength = analyser.fftSize;
      var freqBinDataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqBinDataArray);
      var index = getIndexOfMax(freqBinDataArray)
      var detectedFrequency = ((index)*((audioContext.sampleRate/2)/ analyser.fftSize));
      setFrequency(detectedFrequency)
      var detectedNote = calculateNote(detectedFrequency);
      // setMyNote(prevNote=>{
      //   // console.log("targetNote: "+targetNote)
      //   if (prevNote === detectedNote && detectedNote == targetNote){
      //     setMatchingNoteCount(prevCount=>prevCount+1)
      //   }else{
      //     setMatchingNoteCount(0);
      //   }
      //   return detectedNote;
      // })
      console.log("myNote: "+myNote)
      setMyNote(detectedNote);
      if (detectedNote === myNote && detectedNote === targetNote.substring(0, 1)){
        setMatchingNoteCount(prevCount=>prevCount+1)
      }else{
        setMatchingNoteCount(prevCount=>{
          if (prevCount>1){
            return prevCount - 1
          }
          return 0;
        })
      }
    
      setTimeout(() => {
        setTest(prevTest=>prevTest+1)
      }, 100)
    }
    
  },[test])

  useEffect( ()=>{
    
    if(microphone != 0){
      microphone.connect(analyser);
      // beginRecording();
    }
  },[microphone])

  // useEffect( ()=>{
  //   setMyNote(calculateNote(frequency))
  // },[frequency])

  useEffect( ()=>{
    if(analyser!==0){
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
    }
  },[analyser])

  useEffect( ()=>{
    if(audioContext !== 0){
      setAnalyser(audioContext.createAnalyser());
    }    
  },[audioContext])

  useEffect( ()=>{
    console.log("matchingNoteCount: "+matchingNoteCount)  
    if(matchingNoteCount >= 25){
      if (targetNote == "E2"){
        setE2Tuned(true);
        setTargetNote("A2");

      } else if (targetNote === "A2"){
        setA2Tuned(true);
        setTargetNote("D3");
      } else if (targetNote === "D3"){
        setD3Tuned(true);
        setTargetNote("G3");
      } else if (targetNote === "G3"){
        setG3Tuned(true);
        setTargetNote("B3");
      } else if (targetNote === "B3"){
        setB3Tuned(true);
        setTargetNote("E4")
      } else if (targetNote === "E4"){
        setE4Tuned(true);
      }

      setMatchingNoteCount(0);
    }  
  },[matchingNoteCount])

return (
  <div className="App" style={{height: "100vh"}}>

<div className="ChordsContainer">
    <div className="Chords">

    
<Grid container spacing={1}>

<Grid item xs={2}>
  <div className="Chord">
    {e2Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>E</h2>
      </Fab>
    </div>}

    {!e2Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>E</h2>
      </Fab>
      {(targetNote === "E2") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

<Grid item xs={2}>
  <div className="Chord">
    {a2Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>A</h2>
      </Fab>
    </div>}

    {!a2Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>A</h2>
      </Fab>
      {(targetNote === "A2") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

<Grid item xs={2}>
  <div className="Chord">
    {d3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>D</h2>
      </Fab>
    </div>}

    {!d3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>D</h2>
      </Fab>
      {(targetNote === "D3") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

<Grid item xs={2}>
  <div className="Chord">
    {g3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>G</h2>
      </Fab>
    </div>}

    {!g3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>G</h2>
      </Fab>
      {(targetNote === "G3") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

<Grid item xs={2}>
  <div className="Chord">
    {b3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>B</h2>
      </Fab>
    </div>}

    {!b3Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>B</h2>
      </Fab>
      {(targetNote === "B3") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

<Grid item xs={2}>
  <div className="Chord">
    {e4Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledTunedFab }}
      >
        <h2>E</h2>
      </Fab>
    </div>}

    {!e4Tuned && <div className={classes.wrapper}>
      <Fab
        aria-label="save"
        size={"small"}
        disabled
        classes={{ root: classes.disabledUntunedFab }}
      >
        <h2>E</h2>
      </Fab>
      {(targetNote === "E4") && <CircularProgress size={50} className={classes.fabProgress} />}
    </div>}
  </div>
</Grid>

</Grid>
</div>
    </div>

    <h1>{myNote}</h1>
    <h1>{frequency} Hz</h1>
    <button onClick={init}>Start</button>

    <LinearProgress variant="determinate" value={matchingNoteCount*4} />

    <h1>1.0</h1>
    
    

    
   
  </div>
);
}

export default App;