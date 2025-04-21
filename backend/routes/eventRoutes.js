const { addCategory, addEvents, addKeywords, delCategory, deleteKW, fetchCategories, getAllEvents, getKWList, getRecentEvents, signUp, updateEventCat, updateKWcategory, userAuth, deleteEvents, connectDB } = require("../functions/dbFunctions");
const { extractEvent } = require( "../functions/extractEvent");
const express = require("express");
const { verifyJWToken, authorizeRoles } = require("./middleware");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/sendEventLog", async (req, res) => {

    try {       
        console.log(req.body.message)

        const company_trim = req.body.company.trim();
        const dbName = company_trim +"_EventLogger";
        const models = await connectDB(dbName)

        const All_Events_model = models[1];
        const Event_Keywords_model = models[2];
        const Categories_model = models[3];

        let oldkwList = await getKWList(Event_Keywords_model);   
        let result = extractEvent(req.body.message,oldkwList)

        let eventList = result.newEventDisplay;
        let KWList = result.newKWList;
        console.log("Extracted Event: "+eventList[0].eventName+" KWlist: "+KWList[0].keyword);

        let addCheck = await addEvents(All_Events_model, eventList)
        if(addCheck){  console.log("Events extracted and added to DB!: "+addCheck); }
        else{ console.log("Events not added to DB!"); return res.status(500).send({ message: "Failed to send event log due to Backend Server Error. Please contact support team." });}

        let kwCheck = await addKeywords(Event_Keywords_model,KWList)
        if(kwCheck){ console.log("Keywords extracted and added to DB!: "+kwCheck); }
        else{ console.log("Events not added to DB!"); return res.status(500).send({ message: "Failed to send event log due to Backend Server Error. Please contact support team." });}

        return res.status(200).send({ message: "Event log sent successfully" });

        } catch (error) {
            console.log("Events update Error inside sendEventLog POST: "+error);
           return res.status(500).send({ message: "Failed to send event log due to Backend Server Error. Please contact support team." });
        }
})

router.get("/getAllEvents",verifyJWToken,authorizeRoles(["user","admin"]) , async (req, res) => {
    const All_Events_model = req.models[1];
    getAllEvents(All_Events_model).then((allEvents)=>{
        console.log("Received All events: "+allEvents[0].eventName);
        return res.send({allEvents, role: req.user.role});
    })
    .catch((err)=>{
        console.log("Error: "+err);
        return res.send({allEvents:false, role: req.user.role});
    })
})

router.get("/getRecentEvents",verifyJWToken,authorizeRoles(["user","admin"]) , async (req, res) => {
    console.log("Reached recent events");
    const models = req.models;
    const company_name =  req.user.dbName.split("_")[0];
    console.log("Company name inside recentEvents: ", company_name)
    console.log("Recent events model: ",models);
    const All_Events_model = models[1];
    getRecentEvents(All_Events_model).then((recentEvents)=>{
        console.log("Received recent events "+recentEvents.length);
        return res.send({ recentEvents, role: req.user.role, company: company_name});
    })
    .catch((err)=>{
        console.log("Error in /getRecentEvents : "+err);
    })
})

router.get("/getKeyWords",verifyJWToken, authorizeRoles(["admin"]) , async(req,res)=>{
    const models = req.models;
    const Event_Keywords_model = models[2];
    getKWList(Event_Keywords_model)
    .then((kwList)=>{
        if(kwList && kwList.length!==0){console.log("Received keyword list: "+kwList[0].keyword);}
        return res.send(kwList)
    })
    .catch((err)=>{
        console.log("Error in getKeywords: ", err)
        return res.send([])
    })
})

router.get("/getCategories",verifyJWToken, authorizeRoles(["user","admin"]) , async(req,res)=>{
    try{
        const models = req.models;
        const Categories_model = models[3];
        const fetchRes = await fetchCategories(Categories_model);
        console.log("Fetch Categories: "+fetchRes);
        return res.send({categories: fetchRes, role: req.user.role })
    }catch(err){
        console.log("Fetch Categories error ", err);
        return res.send({categories: [], role: req.user.role })
    }
})

router.post("/save",verifyJWToken, authorizeRoles(["admin"]) ,async (req, res) => {
    const Event_Keywords_model = req.models[2];
    const All_Events_model = req.models[1];
    let kwList = req.body.keywords;
    console.log("Keywords in /save: ",kwList)
    updateKWcategory(Event_Keywords_model,kwList).then((updateRes)=>{
        if(updateRes){
            updateEventCat(All_Events_model,kwList).then((updateEveCatRes)=>{
                console.log("Update Event Category Res: "+updateEveCatRes);
            })
            // console.log("Reached updateKWLISt success");
        getKWList(Event_Keywords_model).then((result)=>{
    //        result.map((element)=>{
    //     console.log("Received Keyword: "+element.keyword+" Category: "+element.category);
    // })
        return res.status(200).send(result);
        })
    }else{
        return res.send(false)
    }
    console.log("Update Res "+updateRes);
    }).catch((error)=>{
        console.log("Error in 'Save Keywords' socket: "+error)
        return res.send(false)
    })
})

router.post("/addKeywords",verifyJWToken, authorizeRoles(["admin"]) ,async (req, res) => {
    try {
        const Event_Keywords_model = req.models[2];
        const All_Events_model = req.models[1];
        let kwList = req.body;
        let kwList_trim = kwList.map((element)=> { return {keyword: element.keyword.trim(), category: element.category.trim() }})
        const addcheck = await addKeywords(Event_Keywords_model,kwList_trim);
        console.log("Add Keyword check: "+addcheck);
        if(addcheck){
            const updateCatCheck = await updateEventCat(All_Events_model,kwList_trim)
            console.log("Update Event Category Res: ",updateCatCheck);
                            
            const kwListRes = await getKWList(Event_Keywords_model);
                // kwListRes.map((element)=>{
                //     console.log("Received Keyword: "+element.keyword+" Category: "+element.category);
                //     }) 
                return res.status(200).send(kwListRes);             
        }else{
            return res.send(false)
        }
    } catch (error) {
        console.log("Error: "+error);
        return res.send(false)
    }
})

router.post("/addCategory",verifyJWToken, authorizeRoles(["admin"]) ,async(req,res)=>{
    try{
        const Categories_model = req.models[3];
        const addCat = req.body;
        const addCheck = await addCategory(Categories_model,addCat);
        console.log("Add Category check: "+addCheck);
        let catlist = [];
        if(addCheck){
            catlist = await fetchCategories(Categories_model);
            console.log("Fetch Categories: "+catlist);
            return res.status(200).send(catlist)
        }else{
            return res.send(false)
    }    
}catch(err){
    console.log("Error: "+err);
    return res.send(false)
}
})

router.post("/deleteKeyword",verifyJWToken, authorizeRoles(["admin"]) ,async(req,res)=>{
   try {
        const All_Events_model = req.models[1];
        const Event_Keywords_model = req.models[2];
        let delItem = req.body;
        const updateEveCatRes = await updateEventCat(All_Events_model,[{keyword: delItem.keyword, category:""}])
 
        // console.log("Update Event Category Res: "+updateEveCatRes);
 
        const delRes = await deleteKW(Event_Keywords_model,delItem)

         if(delRes){
             getKWList(Event_Keywords_model).then((result)=>{
                if(result && result.length!==0){result.map((element)=>{console.log("After deletion updated Keyword: "+element.keyword+" Category: "+element.category);})  }                
                 return res.send(result)
              })             
         }else{
            return res.send([])
         }
     } catch (error) {
        console.log("Error: "+err);
        return res.send(false)
   }
})

router.post("/deleteCategory",verifyJWToken, authorizeRoles(["admin"]) ,async(req,res)=>{
    try{
        const Categories_model = req.models[3];
        let delCat = req.body;
        const delCheck = await delCategory(Categories_model,delCat);
        let catlist = [];
        if(delCheck){
            catlist = await fetchCategories(Categories_model);
            console.log("Fetch Categories: "+catlist);
            return res.send(catlist)
        }else{
            return res.send(false)
    }     
}catch(err){
    console.log("Error: "+err);
    return res.send(false)
}
})

router.post("/deleteAllEvents",verifyJWToken, authorizeRoles(["admin"]) ,async(req,res)=>{
    try{
        const All_Events_model = req.models[1];
        const delCheck = await deleteEvents(All_Events_model);
        console.log("Delete Events check: "+delCheck)
        return res.send(delCheck)
    }catch(err){
        return res.send(false)
}
})

module.exports = router