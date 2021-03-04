import React from 'react';
import './App.css';

import { useState, useEffect } from "react";

import useSound from 'use-sound';
import okay from './sounds/okay.mp3'
import completeSfx from './sounds/complete.mp4'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
// import PlayIcon from '@material-ui/icons/PlayArrowRounded'
import MicIcon from '@material-ui/icons/Mic';


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
  const [myNote, setMyNote] = useState([]);
  const [audioContext, setAudioContext] = useState(0);
  const [analyser, setAnalyser] = useState(0);
  const [microphone, setMicrophone] = useState(0);
  const [startOpen, setStartOpen] = React.useState(true);
  const [endOpen, setEndOpen] = React.useState(false);

  const [noteFeedback, setNoteFeedback] = useState("");

  const [playOkaySfx] = useSound(okay);
  const [playCompleteSfx] = useSound(completeSfx);

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
  var audioContext = new(window.AudioContext || window.webkitAudioContext)();
  var microphone;

  var analyser = audioContext.createAnalyser();

    if (navigator.mediaDevices.getUserMedia) {
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
      analyser.fftSize = 32768; // power of 2, between 32 and max unsigned integer
      var bufferLength = analyser.fftSize;
      var float32 = new Float32Array(analyser.fftSize);


      var freqBinDataArray = new Uint8Array(bufferLength);
      checkAudio(analyser, audioContext, freqBinDataArray)
      setTimeout(beginRecording, 100);
  }



}

function checkAudio(analyser, audioContext, freqBinDataArray)
{
  analyser.getByteFrequencyData(freqBinDataArray);
  var index = getIndexOfMax(freqBinDataArray)

  var detectedFrequency = ((index)*((audioContext.sampleRate/2)/ analyser.fftSize));
  setFrequency(detectedFrequency)
  var detectedNote = calculateNote(detectedFrequency);
  setMyNote(detectedNote);
  setTest(prevTest=>prevTest+1);

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

function getNoteFeedback(wrongNote){
  console.log("in my note: "+wrongNote)
  var tooHigh = "Too High!";
  var tooLow = "Too Low!";
  if (targetNote.substring(0, 1) === "E"){
    if ((wrongNote === "A") || (wrongNote === "D")){
      setNoteFeedback(tooLow);
      }else{
        setNoteFeedback(tooHigh);
      }
  } else if (targetNote.substring(0, 1) === "A"){
      if ((wrongNote === "E") || (wrongNote === "B")){
        setNoteFeedback(tooLow);
      }else{
        setNoteFeedback(tooHigh);
      }

  } else if (targetNote.substring(0, 1) === "D"){
    if ((wrongNote === "E") || (wrongNote === "A")){
      setNoteFeedback(tooLow);
      }else{
        setNoteFeedback(tooHigh);
      }
    
  } else if (targetNote.substring(0, 1) === "G"){
    if ((wrongNote === "A") || (wrongNote === "D")){
      setNoteFeedback(tooLow);
      }else{
        setNoteFeedback(tooHigh);
      }
    
  } else if (targetNote.substring(0, 1) === "B"){
    if ((wrongNote === "D") || (wrongNote === "G")){
      setNoteFeedback(tooLow);
      }else{
        setNoteFeedback(tooHigh);
      }
  }
}
useEffect( ()=>{
},[])

useEffect( ()=>{
    if(test >0){

      if (myNote === targetNote.substring(0, 1)){
        setMatchingNoteCount(prevCount=>prevCount+1)
        setNoteFeedback("Perfect!")
      }else{
        setMatchingNoteCount(prevCount=>{
          // console.log("myNote: "+myNote)
          getNoteFeedback(myNote)
          if (prevCount>1){
            return prevCount - 1
          }
          return 0;
        })
      }
    
    }
    
  },[test])

  useEffect( ()=>{
    
    if(microphone != 0){
      microphone.connect(analyser);
    }
  },[microphone])

  useEffect( ()=>{
    if(analyser!==0){
      if (navigator.mediaDevices.getUserMedia){
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
      playOkaySfx();
      setMatchingNoteCount(0);
    }  
  },[matchingNoteCount])

  useEffect( ()=>{
    if (e4Tuned === true){
      playCompleteSfx();
      setEndOpen(true);
    }
    
  },[e4Tuned])

  const handleClose = () => {
    init();

    setStartOpen(false);
  };

  const handleCloseEnd = () => {
    setE2Tuned(false);
    setB3Tuned(false);
    setG3Tuned(false);
    setD3Tuned(false);
    setA2Tuned(false);
    setE4Tuned(false);

    setTargetNote("E2")

    setEndOpen(false);
  };

return (
  <div className="App" style={{height: "100vh"}}>

      <Dialog
        open={startOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Welcome to Guitar Tuner!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
               Guitar Tuner lets you tune your guitar with automatic frequency detection.
            </p>

            <p>
               Play the open string of your guitar and adjust the tension on the string as indicated. Once the correct note is held for a few seconds Guitar Tuner will automaticaly start tuning the next string.
            </p>
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClose} >
            Lets get started
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={endOpen}
        onClose={handleCloseEnd}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Your Guitar Has Been Tuned!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
               Play your favorite songs knowing your guitar is perfectly tuned.
            </p>
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleCloseEnd} >
            Tune Again
          </Button>
        </DialogActions>
      </Dialog>

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


    <div className="VerticalContainer">
      <div className="VertialCenter">

      </div>

    </div>

    <LinearProgress variant="determinate" value={matchingNoteCount*4} style={{marginTop: "7rem"}} />

    <Grid container spacing={1} style={{marginTop: "8rem"}}>
      <Grid className="MicContainer" item xs={6}>
        <MicIcon className="VertialCenterLeft MicIcon" style={{ fontSize: 60 }}/>
      </Grid>
      <Grid className="MicContainer" item xs={6}>
      <h1 className="VertialCenterRight" style={{ fontSize: 80 }}>{myNote}</h1>
      </Grid>
    </Grid>

    
    <br/>
    <h1  style={{margin:"1rem"}}>{Math.trunc(frequency)} Hz</h1>
    <h1>{noteFeedback}</h1>
    

    
   
  </div>
);
}

export default App;