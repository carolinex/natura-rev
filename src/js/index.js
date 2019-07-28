import Tone from 'tone';
import * as d3 from "d3";

// import style
import './styles/main.scss';

/********************/
/* vars             */
let startBtn;
let instrument;
let playing = false;
let liveNotes, liveDurations, notes, durations;
let noteIndex = 0, durationIndex = 0;
let json;
console.log("Carol");

function setup(){
  d3.json("data/instruments.json")
  .then(function(data){
    json = data;
    //console.log(data);
    Tone.Transport.bpm.value = 140;
    instrument = new Tone.Synth().toMaster();
    setupBtns();
  });
}

function setupBtns(){
  //startBtn = document.querySelector('#startBtn');
  //startBtn.addEventListener('click', initBtnClick);
  d3.selectAll(".play").on("click", playSequence);
  d3.selectAll(".img-list li").on("click", changeOptions);
}

function initBtnClick(event){
  Tone.start();

  if(!startBtn.classList.contains("active")){
    startBtn.classList.add("active");
    startBtn.innerHTML = "stop";
  }else{
    startBtn.classList.remove("active");
    startBtn.innerHTML = "start";
  }
}

function playSequence(){
  let parent = d3.select(this).node().parentNode;
  let input1 = d3.select(parent).select(".notes").node().value.split(",");
  let input2 = d3.select(parent).select(".duration").node().value.split(",");

  if(Tone.Transport.state != 'started') {
    liveNotes = input1;
    liveDurations = input2;
		scheduleNext('+0.2');
	  Tone.Transport.start('+0.1');
    d3.select(this).classed("active", true);
	}else{
    Tone.Transport.stop();
	  Tone.Transport.cancel(0);
    d3.select(this).classed("active", false);
  }
}

function changeOptions(event){
  let options = [];
  let clicked = this;
  let parent = d3.select(this.parentNode).node().parentNode;
  let listItems = d3.select(this.parentNode).selectAll("li");
  let index = 0; //d3.select(parent).attr("data-pos");
  let type = d3.select(this.parentNode).attr("data-type");
  let types = [Tone.Synth, Tone.MetalSynth]

  listItems.each(function(d,i){
    if(clicked != this){
      d3.select(this).classed("active", false);
    }else{
      d3.select(this).classed("active", true);
      index = d3.select(this).attr("data-pos");
      options = json[index];
    }
  });

  Tone.Transport.stop();
  Tone.Transport.cancel(0);

  let test = types[type];
  instrument = new test(options).toMaster();
  scheduleNext('+0.2');
  Tone.Transport.start('+0.1');
  d3.select(parent).select(".play").classed("active", true);
}

function scheduleNext(time){
  notes = liveNotes;

  let currNote = notes[noteIndex % notes.length];
  noteIndex++;
  durations = liveDurations;

  let currDuration = durations[durationIndex % durations.length];
  durationIndex++;

  // play note
  if(instrument.toString() === "NoiseSynth" ||
    instrument.toString() === "MetalSynth"){
  	instrument.triggerAttackRelease(currDuration, time);
  }else{
    instrument.triggerAttackRelease(currNote, currDuration, time);
  }

  //schedule the next event relative to the current time by prefixing "+"
  Tone.Transport.schedule(scheduleNext, "+" + currDuration);
}

setup();

// Needed for Hot Module Replacement
if(typeof(module.hot) !== 'undefined') {
  module.hot.accept() // eslint-disable-line no-undef
}
