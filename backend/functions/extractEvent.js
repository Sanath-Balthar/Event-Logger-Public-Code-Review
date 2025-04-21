
function extractEvent(newEventLog,oldkwList){
    

try {
        let nLsplit = newEventLog.split("\n")
    
    
            // 2 lines each make up 1 event. So join 2 lines each after above splitting.
            let joinEvent = []
            for(let i=0; i<nLsplit.length; i+=2){
                joinEvent.push(nLsplit[i].concat(nLsplit[i+1]))
            }
    
    
    
            // Remove empty strings, add the extracted event into new events array. Extract event Name, check if it already exists and push it to TempKeyword array and store all the events names and event dates into new array to event Display
            
            let newEvents = [];
            let tempdupKWList = [];
    
                joinEvent.map((element)=>{
                    
                    let newEvent = element.split(/\s{3,}/).filter(element=>element.trim()!=="");
                    newEvents.push(newEvent)
                    // console.log("Events: "+ newEvent)
                    tempdupKWList.push({keyword: newEvent[0], category: ""});
                })
    
    
                //   Remove duplicate keywords
    
                let uniqTempKWList = tempdupKWList.filter((element,index,self)=>{
                    return index===self.findIndex((cElement)=>cElement.keyword===element.keyword);
                })
    
                uniqTempKWList.map((element)=>console.log("Unique KW: "+element.keyword))
    
    
                let newKWList = uniqTempKWList.map((element)=>{
                    // lastKWIndex+=1;
                    return {keyword: element.keyword, category: element.category }
                })
    
                // newKWList.map((element)=>console.log("New Unique KW: "+element.keyword))
    
                
    
            // console.log("After split and trim, new Events: "+newEvents);
                let tempnewEvents = [];     
    
                newEvents.map((event)=>{
    
                    // lastEventIndex+=1
    
                    // console.log("Index: "+lastEventIndex);
    
                    const timeRex = /\d{2}:\d{2}:\d{2}[AP] [A-Z]{3} [A-Z]{3} \d{2}, \d{4}/;
    
                    // 06:00:08P TUE JUL 02, 2024     
    
                    let timeStamp = event.map((element)=> {
                        if(element.match(timeRex)){
    
                            const months = {
                                JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
                                JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
                              };
    
                            let matchString = element.match(timeRex);
                            // console.log("Date match: "+matchString);
    
                            // Extract parts from the string
                            const [timeWM,week,month,daystr,year] = matchString[0].split(" ");
                            const day = daystr.split(",")[0];
                            const [time,meridian] = timeWM.split(/([AP])/);
                            const [hours,minutes,seconds] = time.match(/\d+/g).map(Number);
                            
    
                            // // Convert 12-hour format to 24-hour format
                            let hours24 = hours;
                            if (meridian.includes("P") && hours !== 12) hours24 += 12;
                            if (meridian.includes("A") && hours === 12) hours24 = 0;
    
                            // console.log("day:"+day+"year:");
                            let newTS= new Date(year, months[month], day, "18", "00", "08")
                            //   console.log("Date Object: "+newTS)
                            // Create the Date object
                            return new Date(newTS);
                            // return matchString;
    
                        }})
                        .filter((element)=>element!==undefined);
    
                    tempnewEvents.push({ eventName: event[0], timeStamp: timeStamp, category: ""});
                })
    
                let kwMap = new Map(oldkwList.map((item)=> [item.keyword, item]))
    
                let newEventDisplay = tempnewEvents.map((element)=> {
                    if(kwMap.has(element.eventName)){
                        let kw = kwMap.get(element.eventName)
                        return {eventName : element.eventName, timeStamp: element.timeStamp, category: kw.category}
                    }else{ return element}
    
                })
            
    
            newEventDisplay.map((element)=>console.log("New  Event List: \n Event Name: "+ element.eventName));
            newKWList.map((element)=>console.log("New  KW List: \n KW Name: "+ element.keyword));
    
            return {newEventDisplay, newKWList};
} catch (error) {
        console.error("Error in extractEvent:", error);
        throw new Error("Failed to extract events: ", error.message); // Propagate the error to the caller
}

}


module.exports={extractEvent}