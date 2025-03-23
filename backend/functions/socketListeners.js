const { getAllEvents, getRecentEvents, updateKWcategory, updateEventCat, getKWList, addKeywords, deleteKW, fetchCategories, addCategory, delCategory, deleteEvents } = require("./dbFunctions");
const { mqttConnect, mqttConCheck, mqttSubscribe, mqttDisconnect } = require("./mqttConnection");
const nodemailer = require("nodemailer");


// 🔹 Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS
    }
});

let protocol = "mqtt";
let host, port;

let connectUrl; 

function socketListener(socket){
     // Connect to MQTT upon WS request from client
     socket.on('Connect MQTT', (optionsData) => {

       
        try {
            console.log('websocket mqtt request: ');
            
            host = optionsData.host;
            port = optionsData.port;
    
            console.log('Host: '+host+ " Port: "+port);
    
            let options = {
                clientId : optionsData.clientId,
                clean: true,
                connectTimeout: 4000,
                username: optionsData.username,
                password: optionsData.password,
                reconnectPeriod: 1000,
              }
    
            connectUrl = `${protocol}://${host}:${port}`;
    
            console.log("Connect URL: "+connectUrl+" Options: "+options)
            if (['ws', 'wss'].includes(protocol)) {
            connectUrl += '/mqtt'
            }
            
            mqttConnect(socket,connectUrl,options);
        } catch (error) {
            console.log("Error in 'Connect MQTT' socket: "+error)
        }
    
    })

    socket.on("Request MQTT Connection Status", ()=>{
       try{ mqttConCheck(socket);} catch(error){console.log("Error in 'Request MQTT Connection Status' socket: "+error)}
    })

    socket.on("MQTT Subscribe", (props)=>{
           try {
             const topic = props.topic;
             const qos = Number(props.qos)
             console.log("Topic: "+typeof(topic)+" qos: "+typeof(qos));
 
             mqttSubscribe(topic,qos);
           } catch (error) {
            console.log("Error in 'MQTT Subscribe' socket: "+error)
           }
            })

    socket.on("Get All Events", ()=>{
        getAllEvents().then((allEvents)=>{
            console.log("Received recent events: "+allEvents[0].eventName);
            socket.emit("All Events", allEvents);
        })
        .catch((err)=>{
            console.log("Error: "+err);
        })
        
    })

    socket.on("Get Recent Events", ()=>{
        getRecentEvents().then((recentEvents)=>{
            console.log("Received recent events: "+recentEvents[0].eventName);
            socket.emit("Recent Events", recentEvents);
        })
        .catch((err)=>{
            console.log("Error: "+err);
        })
        
    })
    
    socket.on("Save Keywords",  (kwList)=>{
        // kwList.map((element)=>{
        //     console.log("Keyword: "+element.keyword+" Category: "+element.category);
        // })
         updateKWcategory(kwList).then((updateRes)=>{
            if(updateRes){
                updateEventCat(kwList).then((updateEveCatRes)=>{
                    console.log("Update Event Category Res: "+updateEveCatRes);
                })
                // console.log("Reached updateKWLISt success");
            getKWList().then((result)=>{
               result.map((element)=>{
            // console.log("Received Keyword: "+element.keyword+" Category: "+element.category);
        })
        socket.emit("Keyword List", result);
            })
        }else{
            socket.emit("Update Keyword Error");
        }
        console.log("Update Res "+updateRes);
        }).catch((error)=>{
            console.log("Error in 'Save Keywords' socket: "+error)
        })
    })

    socket.on("Add Keyword",async (kwList)=>{
        try {
            const addcheck = await addKeywords(kwList);
            console.log("Add Keyword check: "+addcheck);
            if(addcheck){
                const updateCatCheck = await updateEventCat(kwList)
                console.log("Update Event Category Res: "+updateCatCheck);
                                
                const kwListRes = await getKWList();
                if(kwListRes!==false){
                    kwListRes.map((element)=>{
                        console.log("Received Keyword: "+element.keyword+" Category: "+element.category);
                        }) 
                    socket.emit("Keyword List", kwListRes);               
                }
            }else{
                socket.emit("Add Keyword Error");
            }
        } catch (error) {
            console.log("Error: "+error);
            socket.emit("Add Keyword Error");
        }

    })

    socket.on("Delete Keyword",(delItem)=>{

        updateEventCat([{keyword:delItem.keyword,category:""}]).then((updateEveCatRes)=>{
            console.log("Update Event Category Res: "+updateEveCatRes);
        })

        deleteKW(delItem).then((updateRes)=>{
            if(updateRes){
                getKWList().then((result)=>{
                    result.map((element)=>{
                 console.log("After deletion updated Keyword: "+element.keyword+" Category: "+element.category);
             })
             socket.emit("Keyword List", result);
                 })

                // console.log("Reached updateKWLISt success");
                
            }else{
                socket.emit("Delete Keyword Error");
            }
        }).catch((err)=>{
            console.log("Error: "+err);
            socket.emit("Delete Keyword Error");
        })
    })

    socket.on("Get keywords", ()=>{
        getKWList().then((kwList)=>{
            console.log("Received keyword list: "+kwList[0].keyword);
            socket.emit("Keyword List", kwList);
        })
        .catch((err)=>{
            console.log("Error: "+err);
        })
        
    })

    socket.on("Get Categories", async()=>{
        try{
            const fetchRes = await fetchCategories();
           console.log("Fetch Categories: "+fetchRes);
           if(fetchRes){
               socket.emit("Category List", fetchRes);
           }else{
                console.log("Fetch Categories error ");
           }
        }catch(err){
            console.log("Fetch Categories error ");
        }
    });
           
    socket.on("Add Category", async (addCat)=>{
        try{
                const addCheck = await addCategory(addCat);
                console.log("Add Category check: "+addCheck);

                if(addCheck){
                    const fetchRes = await fetchCategories();
                    console.log("Fetch Categories: "+fetchRes);
                    if(fetchRes){
                        socket.emit("Category List", fetchRes);
                    }else{
                        socket.emit("Add Category Error");
                    }
                }else{
                    socket.emit("Add Category Error");
                }         
        }catch(err){
            console.log("Error: "+err);
            socket.emit("Add Category Error");
        }
    })

    socket.on("Delete Category", async (delCat)=>{
        try{
                const delCheck = await delCategory(delCat);
                if(delCheck){
                const fetchRes = await fetchCategories();
                console.log("Fetch Categories: "+fetchRes);
                if(fetchRes){
                    socket.emit("Category List", fetchRes);
                }else{
                    socket.emit("Delete Category Error");
                }
                }else{
                    socket.emit("Delete Category Error");
            }     
        }catch(err){
            console.log("Error: "+err);
            socket.emit("Delete Category Error");
        }
    })
    
    socket.on("Delete All Events", async ()=>{
     try{
            const delCheck = await deleteEvents();
            console.log("Delete Events check: "+delCheck)
            socket.emit("Deleted All Events");
     }catch(err){
        console.log("Error: "+err);
    }
    })

    socket.on("Send Email", async (res)=>{

        const email = res.email;
        const data = res.data;
        console.log("Email: "+email);
        console.log("Data: "+ data);

        if (!email || !data){
            socket.emit("Invalid Request")
        }

        const textData = data.map(element => `${element.index}, ${element.timeStamp}, ${element.eventName}, ${element.category}`).join("\n");
        
        const mailOptions = {
            from: "sanathabalthar@gmail.com",
            to: email,
            subject: "Event Data",
            text: textData
        };

        try {
            await transporter.sendMail(mailOptions);
            socket.emit("Email sent successfully");
        } catch (error) {
            socket.emit("Error sending email");
        }


    })

    // Handle MQTT connection close
    socket.on('Disconnect MQTT', () => {
        try{mqttDisconnect(socket); }catch(error){console.log("Error in 'Disconnect MQTT' socket: "+error)}       
    });

    // Handle connection close
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });
}

module.exports={socketListener}