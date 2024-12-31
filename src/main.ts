import './style.css'
import { GameOfLife } from './gameOfLife';
import { AddMeasure, CancelLoop, InitializeLoop, PlayDrum, SetBPM, StartLoop } from './tones';


let sequenceActiveIndex = -1;
let instrumentTracks : Element[][] = []

let lastTimeOutID : NodeJS.Timeout;
let sequenceActive = false;
let firstInteract = false;

const GOL = new GameOfLife({x : 8, y : 5});


let themeOptions : Element[] = [];

let currentTheme = localStorage.getItem("theme")
let currentBPM = 120;

SetTheme(currentTheme || "")


function SetTheme(theme : string){
  
  if(theme == ""){
    theme = "birdie"
  }
  
  document.documentElement.classList.value = theme;
  
  HideThemeInList(theme)
  currentTheme = theme;
  localStorage.setItem("theme", theme)
}
function HideThemeInList(theme : string){
  if(themeOptions.length == 0){
    RegisterThemeOptions()
  }
  themeOptions.forEach((element)=>{
    const el = element as HTMLElement;
    //Handle default case
    if(!theme){
      theme = "default"
    }
    
    if(el.dataset.value === theme){
      element.classList.add("no-height")
    } else{
      element.classList.remove("no-height")
    }
  })
}


function ToggleActive(el : Element){
  //Toggle the active class
  el.classList.toggle("active")
  GOL.SetPosition(GetGridFromSquares())
  AddMeasure(GamePositionToNoteArray(GOL.PeekNextPosition()), 1)
  AddMeasure(GamePositionToNoteArray(GOL.grid))
  console.log(GOL.ExportPosition())
}
function SetToggle(el : Element, className : string){
  el.classList.toggle(className)
}
function ToggleLocked(el : Element, index : number){
  
  //Columns and rows aren't what you'd expect because the html is weird
  const colCount = index % 8;
  const rowCount = Math.floor(index / 8)
  el.classList.toggle("locked")
  if(el.classList.contains("locked")){
    GOL.lockedPositions.push({x: rowCount, y: colCount})
    el.innerHTML = `<i class='fa-solid fa-lock lockIcon'></i>`
  } else{
    GOL.lockedPositions = GOL.lockedPositions.map((val)=>{if(val.x !== rowCount || val.y !== colCount){ return val} return {x: NaN, y: NaN}}).filter(val=>!Number.isNaN(val.x))
      el.innerHTML = ``
  }
}
function CancelSequence(){
  clearTimeout(lastTimeOutID);
  CancelLoop()
  OnSequenceExit(sequenceActiveIndex)
  sequenceActiveIndex = -1;
  sequenceActive = false;
}
function HandleFirstInteract(){
  if(!firstInteract){
    const aud = document.createElement('audio')
    aud.src = "/Sounds/1-second-of-silence.mp3"
    aud.play()
    firstInteract = true
    
  }
}
function BeginSequence(){
  
  InitializeLoop(IterateSequence)
  GOL.SetPosition(GetGridFromSquares())
  
  AddMeasure(GamePositionToNoteArray(GOL.PeekNextPosition()), 1)
  AddMeasure(GamePositionToNoteArray(GOL.grid))
  StartLoop(120)
  sequenceActive = true;
}
function GamePositionToNoteArray(position : boolean[][]){
  
  let noteArray : {note : string, position : string}[] = []
  
  position.forEach((row, x)=>{
    
    row.forEach((square, y)=>{
      
      if(square){
        noteArray.push({note : "C" + (y + 1).toString(), position:  ((x * 2) + 1).toString()})
      }
      
    })
  })
  return noteArray
}
function RegisterTiles(){
  
  const tracks : Element[][] = [];
  const rows = document.querySelectorAll(".row");
  
  rows.forEach(el=>{
    const squares = el.querySelectorAll(".square");
    const arr : Element[] = []
    
    squares.forEach(el=>{
      arr.push(el)
    })
    
    tracks.push(arr)
  })
  
  return tracks;
  
}
function TogglePlaying(){
  
  //Start or stop the sequence
  if(sequenceActive){
    CancelSequence()
  } else{
    BeginSequence()
  }
  //Set the icon
  const icon = document.querySelector("#play i");
  
  icon?.classList.remove(sequenceActive? "fa-play" : "fa-stop");
  icon?.classList.add(sequenceActive? "fa-stop" : "fa-play");
  
}
function RegisterThemeOptions(){
  const options = document.querySelectorAll(".selectOption");
  options.forEach(el=>{
    const ele = el as HTMLElement
    if(el){
      if(ele.dataset.value){
        themeOptions.push(el);
        ele.addEventListener("click", ()=>{
          SetTheme(ele.dataset.value || "")
        })
        
      }
    }
  })
}
function AdjustBPM(num : number){
  if(num > 999){
    console.log(num)
    num = 999
  } else if (num < 0){
    num = 0
  }
  currentBPM = num
  SetBPM(num)
  console.log(currentBPM)

}
function AddListenersOnLoad(){
  //Add event listeners to elements
  
  //Controls
  
  //Start the sequencer
  const playButton = document.querySelector("#play");
  playButton?.addEventListener("click", TogglePlaying)
  
  //Theme Selection
  const themeSelect = document.querySelector("#themeSelect")
  //Select the theme
  
  //close menu if mouse leaves the element
  themeSelect?.addEventListener("mouseleave", ()=>{themeSelect.classList.remove("open")})
  
  const options = document.querySelectorAll(".selectOption");
  
  themeSelect?.addEventListener("click", ()=>{
    
    const icon = themeSelect.querySelector(".fa-solid")
    SetToggle(themeSelect, "open")
    console.log(icon)
    if(icon){
      SetToggle(icon, "fa-chevron-down")
      SetToggle(icon, "fa-chevron-up")
    }
    
  })
  
  options.forEach(el=>{
    const ele = el as HTMLElement
    if(el){
      if(ele.dataset.value){
        themeOptions.push(el);
        ele.addEventListener("click", ()=>{
          SetTheme(ele.dataset.value || "")
        })
        
      }
    }
  })
  
  //Adjust bpm
  //Input
  const bpmInput = document.querySelector("#bpm") as HTMLInputElement
  const incrementUp = document.querySelector("#incUp")
  const incrementDown = document.querySelector("#incDown")

  incrementDown?.addEventListener("click", ()=>{AdjustBPM(currentBPM += -5); bpmInput.value = currentBPM.toString()})
  incrementUp?.addEventListener("click", ()=>{AdjustBPM(currentBPM += 5); bpmInput.value = currentBPM.toString()})
  bpmInput.value = currentBPM.toString()
  bpmInput?.addEventListener("change", (e)=>{
    const target = e.target as HTMLInputElement;
    const number = parseInt(target.value);
    //If the new value is a number, set the bpm to the value
    //Otherwise set the value to the bpm
    if(number){
      AdjustBPM(number)
      bpmInput.value = currentBPM.toString()
    } else{
      target.value = currentBPM.toString()
    }
    
  })
  
  
  //Click Events for squares
  const squares = document.querySelectorAll(".square");
  
  squares.forEach((el, i)=>{
    el.addEventListener("click", ()=>{ToggleActive(el);HandleFirstInteract()})
    el.addEventListener("contextmenu", (e)=>{e.preventDefault(); ToggleLocked(el, i)})
    //AddLongPressListener(el, (e)=>{e.preventDefault(); ToggleLocked(el, i)})
  })
}
function OnLoopBack(){
  
  PlayDrum()
  GOL.AdvancePosition()
  AddMeasure(GamePositionToNoteArray(GOL.PeekNextPosition()), 1)
  GetSquaresFromGrid(GOL)
}
function IterateSequence(){
  
  //Remove last hit
  OnSequenceExit(sequenceActiveIndex);
  //Increment the index, returning to zero when needed
  sequenceActiveIndex += 1;
  if(sequenceActiveIndex > (instrumentTracks[0]?.length - 1 || 0)){
    OnLoopBack();
    sequenceActiveIndex = 0;
  }
  //Perform current hit
  OnSequenceHit(sequenceActiveIndex);
}
function OnSequenceHit(i : number){
  instrumentTracks.forEach(row=>{
    if(row.length >= i - 1 && i >= 0){
      row[i].classList.add("focus")
    }
  })
}
function OnSequenceExit(i : number){
  instrumentTracks.forEach(row=>{
    if(row.length >= sequenceActiveIndex - 1 && i >= 0){
      row[i].classList.remove("focus")
    }
  })
}
function GetGridFromSquares(){
  let grid : {x: number, y : number}[] = [];
  instrumentTracks.forEach((row, y) =>{
    row.forEach((sqr, x)=>{
      if(sqr.classList.contains("active")){
        
        grid.push({x, y})
      }
    })
  })
  return grid;
}

function GetSquaresFromGrid(gol : GameOfLife){
  instrumentTracks.forEach((row, y)=>{
    row.forEach((el, x)=>{
      //If the square exists in the gol array, make it active else make it inactive
      if(gol.grid[x]?.[y]){
        el.classList.add("active")
      } else{
        el.classList.remove("active")
      }
    })
  })
}
window.addEventListener("load",()=>{
  AddListenersOnLoad()
  instrumentTracks = RegisterTiles()
})
