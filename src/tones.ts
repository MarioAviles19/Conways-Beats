import * as Tone from "tone"


export function PlayDrum(){

}


let drum = new Tone.Sampler({
    "C1" : "/Sounds/hihat.mp3",
    "C2" : "/Sounds/snare.mp3",
    "C3" : "/Sounds/kick.mp3",
    "C4" : "/Sounds/tom1.mp3",
    "C5" : "/Sounds/tom2.mp3",
    "C6" : "/Sounds/tom3.mp3",
}).toDestination();

export function SetBPM(newNumber : number){
    Tone.getTransport().bpm.value = newNumber
}
export function InitializeLoop(onBeat : ()=>void){
    if(drum.disposed){
        drum = new Tone.Sampler({
            "C1" : "/Sounds/hihat.mp3",
            "C2" : "/Sounds/snare.mp3",
            "C3" : "/Sounds/kick.mp3",
            "C4" : "/Sounds/tom1.mp3",
            "C5" : "/Sounds/tom2.mp3",
            "C6" : "/Sounds/tom3.mp3",
        }).toDestination();
    }

     Tone.getTransport().scheduleRepeat(function(time){
        Tone.getDraw().schedule(function(){

            if(Tone.getTransport().state == "started"){
                onBeat()
            }
        }, time) //use AudioContext time of the event

    }, "8n")

    

}

export function StartLoop(bpm = 120){
    drum.context.resume()
    Tone.getContext().resume()
    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().start("+0", "0:0:0")
}
export function CancelEvent(id : number){

    Tone.getTransport().clear(id)

}
function GetMeasureNumber(offset : number = 0){
    return (parseInt(Tone.getTransport().position.toString().split(":")[0]) + offset);
}
export function AddNoteToMeasure(note : string, position : string, offset : number = 0){

    
    const nextMeasurenumber = GetMeasureNumber(offset)
    const noteTime = nextMeasurenumber+ ":0:" + position
    
    
    // Schedule a note to play at the start of the new measure

    return Tone.getTransport().schedule((time) => {
        drum.triggerAttack(note, time)

    }, noteTime);
}


export function AddMeasure(notes : {note : string, position : string}[], offset : number = 0){
    notes.forEach((ev)=>{
        AddNoteToMeasure(ev.note, ev.position, offset)
    })

}

export function CancelLoop(){
    Tone.getTransport().stop();
    Tone.getTransport().cancel("0:0:0");
    Tone.getTransport().position = "0:0:0"
    drum.releaseAll()
}