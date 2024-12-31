export function AddLongPressListener(el : Element, callback : (e : Event)=>void, timeout : number = 500){

    let eventID : NodeJS.Timeout;
    el.addEventListener("pointerdown", (e)=>{

        eventID = setTimeout(() => {
            callback(e)
        }, timeout);
    })
    el.addEventListener("pointerup", ()=>{
        clearTimeout(eventID)
    })

}