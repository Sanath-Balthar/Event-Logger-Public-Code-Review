const mqtt = require("mqtt");
const { extractEvent } = require("./extractEvent");
const { addEvents, deleteEvents, getRecentEvents, updateKWList, getKWList, getAllEvents, addKeywords } = require("./dbFunctions");

// let eventList, KWList;
// const topic = '/nodejs/mqtt/'
// const payload = 'nodejs mqtt test'
// const qos = 0

let client = null;

function mqttConnect(socket, connectUrl, options){
console.log("Reached mqtt connect function");

    if(client===null){

        client = mqtt.connect(connectUrl, options);


            client.on('connect', () => {
                console.log(` MQTT Connected`)
                socket.emit("MQTT connected")
            })

            client.on('message', async (topic, payload) => {
                console.log('Received Message:', payload.toString())

                try {

                // let tempoldKWList = await getKWList();
                // let oldKWList = tempoldKWList.sort((a,b)=>{
                //    return a["index"]>b["index"]?1:-1
                // })
                // let tempoldAllEvents = await getAllEvents();
                // let oldAllEvents = tempoldAllEvents.sort((a,b)=>{
                //     return a["index"]>b["index"]?1:-1
                // })
                // let lastEventIndex;
                // let lastKWIndex;

                // if(oldKWList.length!==0){
                //     lastKWIndex = oldKWList[oldKWList.length-1].index;
                //     oldKWList.map((element)=>{
                //         console.log("oldKWLISt index: "+element.index)
                //     })
                // }else{
                //     lastKWIndex = 0;
                // }

                // if(oldAllEvents.length!==0){
                //     lastEventIndex = oldAllEvents[oldAllEvents.length-1].index;
                //     oldAllEvents.map((element)=>{
                //         console.log("oldAllEvents index: "+element.index)
                //     })
                // }else{
                //     lastEventIndex = 0;
                // }

                // console.log('Last Event Index ',lastEventIndex)
                // console.log('Last KW Index ',lastKWIndex)
                

                let result = extractEvent(payload.toString())

                let eventList = result.newEventDisplay;
                let KWList = result.newKWList;

                console.log("Extracted Event: "+eventList[0].eventName+" KWlist: "+KWList[0].keyword);


                    let addCheck = await addEvents(eventList)
                    if(addCheck){
                    let recentEvents = await getRecentEvents();
                    socket.emit('Recent Events', recentEvents);
        
                    let allEvents = await getAllEvents();
                    socket.emit('All Events', allEvents);
                    }
        
        
                    let kwCheck = await addKeywords(KWList)
                    if(kwCheck){
                        let kwRes = await getKWList();
                        console.log("Emitting KW List: "+ kwRes[0].keyword);
                        socket.emit('Keyword List', kwRes);
                    }
                } catch (error) {
                    console.log("Events update Error inside MQTT Connect: "+error);
                }

            })

            client.on('reconnect', (error) => {
            console.log(`Reconnecting):`, error)
            })

            client.on('error', (error) => {
            console.log(`Cannot connect:`, error)
            })

            client.on("close", () => {
                console.log("MQTT Client: "+client.connected)
                console.log("MQTT connection closed!");
                client= null;
                socket.emit("MQTT Disconnected")
            });

      }else{
        socket.emit("MQTT duplicate connection");
    }
        
    }


function mqttSubscribe(topic, qos){

    if (!client || !client.connected) {
        console.error("❌ MQTT client is not connected. Cannot subscribe.");
        return;
      }

      console.log("Reached MQTTSubscribe");

    // console.log("Topic: "+topic+" qos: "+qos);

     client.subscribe(topic, { qos }, (error) => {
            if (error) {
            console.log('subscribe error:', error)
            return
            }
            console.log(`Subscribe to topic '${topic}'`)

            // client.publish(topic, payload, { qos }, (error) => {
            //   if (error) {
            //     console.error(error)
            //   }
            // })
        })
}

function mqttDisconnect(socket){
    if(client===null){
        socket.emit("No connection exists")
    }else{
    client.end(false, ()=>{
        console.log("Disconnect requested.");
     })
    }
}

function mqttConCheck(socket){
    if(client===null){
        socket.emit("MQTT Connection Status", false)
    }else{
        socket.emit("MQTT Connection Status", true)
    }
}


module.exports={mqttConnect, mqttSubscribe, mqttDisconnect,mqttConCheck}

/**
 * If you need to unsubscribe from a topic, you can use the following code.
 */
// // unsubscribe topic
// // https://github.com/mqttjs/MQTT.js#mqttclientunsubscribetopictopic-array-options-callback
// client.unsubscribe(topic, { qos }, (error) => {
//   if (error) {
//     console.log('unsubscribe error:', error)
//     return
//   }
//   console.log(`unsubscribed topic: ${topic}`)
// })

/**
 * If you need to disconnect, you can use the following code.
 */
// if (client.connected) {
//   try {
//     // disconnect
//     // https://github.com/mqttjs/MQTT.js#mqttclientendforce-options-callback
//     client.end(false, () => {
//       console.log('disconnected successfully')
//     })
//   } catch (error) {
//     console.log('disconnect error:', error)
//   }
// }